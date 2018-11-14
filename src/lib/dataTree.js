import * as _ from 'lodash'

/**
 * Convert a nested object into a Vuetify data Tree.
 * @param target
 */
const dataTree = (target) => {
  let out = []

  for (const key in target) {
    // Non-primitive, recurse
    if (_.isObject(target[key])) {
      out.push({
        name: key,
        icon: 'mdi-json',
        children: dataTree(target[key])
      })

    // Primitive
    } else {
      out.push({
        name: key,
        icon: 'mdi-text-short'
      })
    }
  }

  return out
}

export default dataTree
