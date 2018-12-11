import * as _ from 'lodash'

/**
 * Convert a nested object into a Vuetify data Tree.
 * @param target
 */
const dataTree = (target, accKey = null) => {
  let out = []

  for (const key in target) {
    // Non-primitive, recurse
    if (_.isObject(target[key])) {
      const accumulativeKey = accKey === null
        ? key
        : `${accKey}.${key}`
      out.push({
        text: `<span class="property">${key}</span>: ${target[key].constructor.name}`,
        key: accumulativeKey,
        // icon: 'mdi-json',
        children: dataTree(target[key], accumulativeKey)
      })

    // Primitive
    } else {
      const accumulativeKey = accKey === null
        ? key
        : `${accKey}.${key}`
      const formattedvalue = (typeof target[key] === 'string') ? `"${target[key]}"` : target[key]

      out.push({
        text: `<span class="property">${key}</span>: <span class="${typeof target[key]}">${formattedvalue}</span>`,
        key: accumulativeKey
        // icon: 'mdi-text-short'
      })
    }
  }

  return out
}

export default dataTree
