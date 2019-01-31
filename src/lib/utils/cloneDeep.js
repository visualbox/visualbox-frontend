/**
 * Deep clone an object.
 * @param  {Object} object Object to clone
 * @return {Object}        New object
 */
export default (object) => {
  return JSON.parse(JSON.stringify(object))
}
