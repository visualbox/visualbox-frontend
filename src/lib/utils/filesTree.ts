import { parseFileType } from '@/lib/utils'

/*
[full/file/path/focus.json] {
  name: 'foo.json',
  type: 'file|folder',
  fullPath: 'full/file/path/foo.json'
}
*/

interface IFile {
  fullPath: string
  name: string
  type: string
  file?: string
  children?: IFile[]
}

const createFolder = (out: IFile[], fullPath: string) => {
  let target = out
  const folderPath = fullPath.split('/')

  let i = 0
  for (const folderName of folderPath) {
    i++
    const found = target.find(({ name, type }) => name === folderName && type === 'folder')
    if (!found) {
      const newFolder = {
        name: folderName,
        fullPath: folderPath.slice(0, i).join('/'),
        type: 'folder',
        children: []
      }
      target.push(newFolder)
      target = newFolder.children
    } else
      target = found.children || out
  }
}

const getFolder = (out: IFile[], fullPath: string) => {
  let target = out
  const folderPath = fullPath.split('/')
  folderPath.pop() // Remove ending filename

  if (folderPath.length === 0)
    return target

  for (const folderName of folderPath) {
    const found = target.find(({ name, type}) => name === folderName && type === 'folder')
    if (!found)
      continue
    target = found.children || out
  }

  return target
}

const filesTree = (files: IFile[]) => {
  const out: IFile[] = []
  files = Object.values(files)

  const folders = files.filter(({ type }) => type === 'folder')
  for (const folder of folders)
    createFolder(out, folder.fullPath)

  const nonFolders = files.filter(({ type }) => type === 'file')
  for (const nonFolder of nonFolders) {
    const { name, fullPath } = nonFolder
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
