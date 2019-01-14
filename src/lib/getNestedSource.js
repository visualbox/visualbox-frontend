/**
 * Deep diff between two object, using lodash
 * @param  {Object} object    Object to be searched
 * @param  {Object} property  Array or string of property to get
 * @return {Object}           Return found value
 */
const getNestedSource = (object, property) => {
  let current = object
  for (var i = 0, l = property.length; i < l; ++i) {
    if (Object(current) === current)
      current = current[property[i]]
    else {
      current = undefined
      break
    }
  }
  return current
}

export default getNestedSource
