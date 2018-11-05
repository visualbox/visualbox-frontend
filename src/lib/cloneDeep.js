/**
 * Deep clone an object.
 * @param object
 */
const cloneDeep = (object) => {
  return JSON.parse(JSON.stringify(object))
}

export default cloneDeep
