import get from 'lodash-es/get'
import { cloneDeep } from '@/lib/utils'

/**
 * Get a property in the package.json file.
 */
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

/**
 * Parse the version and name from a string.
 */
export const parseNameVersion = (str: string): [ string, string ] => {
  const [ a, b, c ] = str.split('@')

  // Name starts with '@' (e.g. @angular/core)
  if (str.charAt(0) === '@')
    return [ `@${b}`, c || '*' ]
  else
    return [ a, b || '*' ]
}

/**
 * Return a cloned object of a project package.
 */
export const clonePackageJson = (state: object) => {
  try {
    const contents = get(state, ['files', 'package.json', 'contents'], null)
    if (!contents)
      return { dependencies: {} }

    const json = JSON.parse(contents)
    if (!json.hasOwnProperty('dependencies'))
      json.dependencies = {}

    return json
  } catch (e) {
    return null
  }
}
