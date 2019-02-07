/**
 * Deep clone an object.
 * @param  {any} object Object to clone
 * @return {any}        New object
 */
export default (object: any): any => {
  return JSON.parse(JSON.stringify(object))
}
