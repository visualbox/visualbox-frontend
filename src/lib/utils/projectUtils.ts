import get from 'lodash-es/get'

export const fileContents = (files: object, path: string[]) => {
  return get(files, [...path, 'contents'], null)
}
