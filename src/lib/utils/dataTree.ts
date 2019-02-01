import isObject from 'lodash-es/isObject'

const MAX_LEVEL_COUNT: number = 15

interface INode {
  key: string
  text: string
  children?: INode[]
}

/**
 * Convert a nested object into a Vuetify data Tree.
 * @param  {IObject} target Target object to traverse
 * @param  {String}  accKey Accumulated key
 * @return {INode[]}        Vuetify tree array
 */
const dataTree = (target: IObject, accKey: string | null = null): INode[] => {
  const out: INode[] = []
  let levelCount: number = 0

  for (const key in target) {
    if (!target.hasOwnProperty(key))
      continue

    // Limit number of primitives per level
    // to increase performance
    levelCount++
    if (levelCount > MAX_LEVEL_COUNT)
      continue

    // Non-primitive, recurse
    if (isObject(target[key])) {
      const accumulativeKey: string = accKey === null
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
      const accumulativeKey: string = accKey === null
        ? key
        : `${accKey}.${key}`
      const formattedvalue: string = (typeof target[key] === 'string') ? `"${target[key]}"` : target[key]

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
