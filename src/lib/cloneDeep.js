/**
 * Deep clone an object.
 * @param object
 */
export default (object) => {
  return JSON.parse(JSON.stringify(object))
}
