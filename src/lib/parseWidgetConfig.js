import * as _ from 'lodash'

const VALID_TYPES = [
  'text'
]

/**
 * Parse widget JSON configuration string
 * @param  {String} config Widget configuration JSON string
 * @return {Object}        Return an object with parsed config and error message(s)
 */
const parseWidgetConfig = config => {
  try {
    const parsed = JSON.parse(config)

    // Config is array
    if (!_.isArray(parsed)) {
      return {
        error: ['Config definition is not an array.'],
        variables: []
      }
    }

    let out = {
      error: [],
      variables: []
    }
    for (let i in parsed) {
      const field = parsed[i]

      // Contains required field 'type'
      if (!_.has(field, 'type')) {
        out.error.push(`Missing required property 'type', in field #${i}`)
        continue
      }
      // Field 'type' is string
      if (typeof field.type !== 'string') {
        out.error.push(`Property 'type' must be a string, in field #${i}`)
        continue
      }
      // Field 'type' is supported
      if (!VALID_TYPES.includes(field.type.toLowerCase())) {
        out.error.push(`Property 'type' has an invalid value: '${field.type}', in field #${i}`)
        continue
      }
      // Contains required field 'name'
      if (!_.has(field, 'name')) {
        out.error.push(`Missing required property 'name', in field #${i}`)
        continue
      }
      // Field 'name' is string
      if (typeof field.name !== 'string') {
        out.error.push(`Property 'name' must be a string, in field #${i}`)
        continue
      }
      // Contains required field 'label'
      if (!_.has(field, 'label')) {
        out.error.push(`Missing required property 'label', in field #${i}`)
        continue
      }
      // Field 'label' is string
      if (typeof field.label !== 'string') {
        out.error.push(`Property 'label' must be a string, in field #${i}`)
        continue
      }
      // Field 'name' is unique
      // Optional field '' is supported
      // ...

      out.variables.push({
        type: field.type.toLowerCase(),
        name: field.name,
        label: field.label
      })
    }

    return out
  } catch (e) {
    return {
      error: [e.toString()],
      variables: []
    }
  }
}

export default parseWidgetConfig
