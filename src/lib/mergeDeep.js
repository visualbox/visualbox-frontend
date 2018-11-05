import * as _ from 'lodash'

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
const mergeDeep = (target, ...sources) => {
  if (!sources.length)
    return target
  const source = sources.shift()

  if (_.isObject(target) && _.isObject(source)) {
    for (const key in source) {
      if (_.isObject(source[key])) {
        if (!target[key])
          Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

export default mergeDeep
