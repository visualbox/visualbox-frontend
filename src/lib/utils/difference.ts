import transform from 'lodash-es/transform'
import isEqual from 'lodash-es/isEqual'
import isObject from 'lodash-es/isObject'

/**
 * Deep diff between two object, using lodash
 * @param  {IObject} object Object compared
 * @param  {IObject} base   Object to compare with
 * @return {IObject}        Return a new object who represent the diff
 */
export default (object: IObject, base: IObject): IObject => {
  const changes = (o: IObject, b: IObject) => {
    return transform(o, (result: IObject, value, key) => {
      if (!isEqual(value, b[key]))
        result[key] = (isObject(value) && isObject(b[key])) ? changes(value, b[key]) : value
    })
  }
  return changes(object, base)
}
