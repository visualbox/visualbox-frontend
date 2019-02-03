import { parseFileType } from '@/lib/utils'

/*
[full/file/path/focus.json] {
  name: 'foo.json',
  type: 'file|folder',
  fullPath: 'full/file/path/foo.json'
}
*/

const createFolder = (out, fullPath) => {
  let target = out
  const folderPath = fullPath.split('/')

  for (const i in folderPath) {
    const folderName = folderPath[i]
    const found = target.find(({ name, type }) => name === folderName && type === 'folder')
    if (!found) {
      const newFolder = {
        name: folderName,
        fullPath: folderPath.slice(0, i + 1).join('/'),
        type: 'folder',
        children: []
      }
      target.push(newFolder)
      target = newFolder.children
    } else {
      target = found.children
    }
  }
}

const getFolder = (out, fullPath) => {
  let target = out
  let folderPath = fullPath.split('/')
  folderPath.pop() // Remove ending filename

  if (folderPath.length === 0)
    return target

  for (const i in folderPath) {
    const folderName = folderPath[i]
    const found = target.find(({ name, type}) => name === folderName && type === 'folder')
    target = found.children
  }

  return target
}

const filesTree = files => {
  let out = []
  files = Object.values(files)

  const folders = files.filter(({ type }) => type === 'folder')
  for (const i in folders) {
    const { fullPath } = folders[i]
    createFolder(out, fullPath)
  }

  const nonFolders = files.filter(({ type }) => type === 'file')
  for (const i in nonFolders) {
    const { name, fullPath } = nonFolders[i]
    const folder = getFolder(out, fullPath)
    folder.push({
      name,
      fullPath,
      type: 'file',
      file: parseFileType(name)
    })
  }

  return out
}

export default filesTree
