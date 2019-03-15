import JSZip from 'jszip'

interface IFileTreeNode {
  name: string
  displayName: string
  dir: boolean
  children?: IFileTreeNode[]
}

/**
 * Given an absolute path,
 * return the display name.
 *  - foo/         -> foo
 *  - foo/bar      -> bar
 *  - foo/bar/baz/ -> baz
 */
const getDisplayName = name => {
  try {
    const arr = name.split('/')
    const last = arr.pop()

    // Is folder
    if (last === '')
      return arr.length > 0 ? arr.pop() : ''
    // Is file
    else
      return last
  } catch (e) {
    console.log(e)
    return name
  }
}

/**
 * Change last part of name with newName.
 *  - foo/bar baz -> foo/baz
 *  - baz bar -> bar
 *  - foo/bar /baz -> foo/baz
 */
const getNewFileAbsolutePath = (name, newName) => {
  try {
    newName = newName.replace(/^\//, '') // Remove leading '/'
    const arr = name.split('/')
    arr.pop()
    arr.push(newName)
    return arr.join('/')
  } catch (e) {
    return name
  }
}

/**
 * Change last part of name with newName (folder).
 *  - foo/bar/ baz -> foo/baz/
 *  - baz/ bar -> bar/
 *  - foo/bar/ /baz -> foo/baz/
 */
const getNewFolderAbsolutePath = (name, newName) => {
  try {
    newName = newName.replace(/^\//, '') // Remove leading '/'
    const arr = name.split('/')
    arr.pop()
    arr.pop()
    arr.push(newName)
    return arr.join('/') + '/'
  } catch (e) {
    return name
  }
}

/**
 * Given a JSZip folder, return
 * only files in current level.
 */
const getFilesInFolder = folder => {
  return folder.filter(relativePath => {
    // Count number of '/'
    const arr = relativePath.split('/')
    // Current folder item can only be file or two-entry arr with empty end
    return (arr.length === 1 || (arr.length === 2 && arr[arr.length - 1] === ''))
  })
}

const getUniqueName = (prefix, dir, folder) => {
  const suffix = dir ? '/' : ''
  const folderFiles = getFilesInFolder(folder).map(({ name }) => name)

  let i = 1
  let uniqueName = prefix + suffix
  while (folderFiles.includes(uniqueName)) {
    uniqueName = `${prefix} (${i})${suffix}`
    i++
  }
  return uniqueName
}

class Zip {
  public zip

  constructor () {
    this.zip = new JSZip()
  }

  public get () {
    return this.zip
  }

  public reset (val = null) {
    this.zip = val ? val : new JSZip()
  }

  public async getBlob () {
    return await this.zip.generateAsync({ type: 'blob' })
  }

  get fileTree () {
    const convertLevel = (lvl, folder) => {
      const outFolder: IFileTreeNode[] = []

      getFilesInFolder(folder).forEach(({ name, dir }) => {
        const item: IFileTreeNode = {
          displayName: getDisplayName(name),
          name,
          dir
        }

        // Recurse down sub-folder
        if (dir)
          item.children = convertLevel(lvl + 1, this.zip.folder(name))

        outFolder.push(item)
      })

      return outFolder
    }

    return convertLevel(0, this.zip)
  }

  /**
   * Add file to a parent folder.
   * Specify if file is dir and what
   * the new name should eb prefixed by.
   * Return { name, displayName }
   */
  public addFile ({ parent = '', dir = false, prefix = 'New File' }) {
    const folder = this.zip.folder(parent)
    const newName = getUniqueName(prefix, dir, folder)

    if (dir)
      folder.folder(newName)
    else
      folder.file(newName, '')

    return {
      name: `${parent + newName}`,
      displayName: newName.replace('/', '')
    }
  }

  public deleteFile (name) {
    this.zip.remove(name)
  }

  /**
   * newName is displayName
   */
  public async renameFile ({ name, newName }) {
    try {
      const file = this.zip.file(name)
      newName = getNewFileAbsolutePath(name, newName)

      // No name change
      if (newName === name)
        return newName

      this.zip.file(newName, await file.async('text'))
      this.zip.remove(name)

      return newName

    } catch (e) {
      throw e
    }
  }

  public async renameFolder ({ name, newName }) {
    try {
      const file = this.zip.folder(name)
      newName = getNewFolderAbsolutePath(name, newName)

      // No name change
      if (newName === name)
        return newName

      const newFolder = this.zip.folder(newName)

      // Fill folder with previous folder
      const jobs: Array<Promise<void>> = []
      file.forEach((relativePath, oldFile) => {
        jobs.push((async () => {
          if (oldFile.dir)
            newFolder.folder(relativePath)
          else
            newFolder.file(relativePath, await oldFile.async('text'))
        })())
      })

      await Promise.all(jobs)
      this.zip.remove(name)

      return newName

    } catch (e) {
      throw e
    }
  }

  public writeFile ({ name, contents }) {
    this.zip.file(name, contents)
  }

  public async readFile (name) {
    return await this.zip.file(name).async('text')
  }
}

export default new Zip()
