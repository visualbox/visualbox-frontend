import * as _ from 'lodash'

const MAX_LEVEL_COUNT = 15

/**
 * Convert a nested object into a Vuetify data Tree.
 * @param  {Object} target Target object to traverse
 * @param  {String} accKey Accumulated key
 * @return {Array}         Vuetify tree array
 */
const dataTree = (target, accKey = null) => {
  let out = []
  let levelCount = 0

  for (const key in target) {
    // Limit number of primitives per level
    // to increase performance
    levelCount++
    if (levelCount > MAX_LEVEL_COUNT)
      continue

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

  // Append explanation at the end of current level
  // if the max count was hit
  if (levelCount > MAX_LEVEL_COUNT) {
    out.push({
      text: `<span class="hidden">${levelCount} hidden</span>`,
      key: 'null'
    })
  }

  return out
}

export default dataTree
