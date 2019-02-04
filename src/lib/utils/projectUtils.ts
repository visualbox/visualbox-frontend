import get from 'lodash-es/get'

export const packageJson = (project: object, path: string, def: string) => {
  try {
    const contents = get(project, ['files', 'package.json', 'contents'], null)
    if (!contents)
      return def

    const json = JSON.parse(contents)
    return get(json, path, def)
  } catch (e) {
    return def
  }
}

export const fileContents = (files: object, path: string[]) => {
  return get(files, [...path, 'contents'], null)
}
