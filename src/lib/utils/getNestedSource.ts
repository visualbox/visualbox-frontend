/**
 * Deep diff between two object, using lodash
 * @param  {IObject}           object    Object to be searched
 * @param  {string[] | string} property  Array or string of property to get
 * @return {any}                         Return found value
 */
export default (object: IObject, property: string[] | string): any => {
  let current: any = object
  for (let i = 0, l = property.length; i < l; ++i) {
    if (Object(current) === current)
      current = current[property[i]]
    else {
      current = undefined
      break
    }
  }
  return current
}
