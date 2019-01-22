import * as _ from 'lodash'

const VALID_TYPES = [
  'text',
  'password',
  'color',
  'switch',
  'slider',
  'select'
]

/*
const OPTIONAL_PROPS = [
  'default'
]
*/

/**
 * Parse JSON configuration string
 * @param  {String} config Configuration JSON string
 * @return {Object}        Return an object with parsed config and error message(s)
 */
export default config => {
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
      if (!_.isString(field.type)) {
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
      if (!_.isString(field.name)) {
        out.error.push(`Property 'name' must be a string, in field #${i}`)
        continue
      }
      // Field 'name' is unique
      if (out.variables.findIndex(v => v.name === field.name) > -1) {
        out.error.push(`Property 'name' must be unique, in field #${i}`)
        continue
      }
      // Contains required field 'label'
      if (!_.has(field, 'label')) {
        out.error.push(`Missing required property 'label', in field #${i}`)
        continue
      }
      // Field 'label' is string
      if (!_.isString(field.label)) {
        out.error.push(`Property 'label' must be a string, in field #${i}`)
        continue
      }

      let optionals = {}
      // Optional field 'default' is supported
      if (_.has(field, 'default'))
        optionals.default = field.default
      // Optional fields 'min' and 'max' is supported
      if (field.type === 'slider') {
        // Contains required field 'min'
        if (!_.has(field, 'min')) {
          out.error.push(`Missing required property 'min', in field #${i}`)
          continue
        }
        // Field 'min' is number
        if (!_.isNumber(field.min)) {
          out.error.push(`Property 'min' must be a number, in field #${i}`)
          continue
        }
        // Contains required field 'max'
        if (!_.has(field, 'max')) {
          out.error.push(`Missing required property 'max', in field #${i}`)
          continue
        }
        // Field 'max' is number
        if (!_.isNumber(field.max)) {
          out.error.push(`Property 'min' must be a number, in field #${i}`)
          continue
        }

        // Add min/max
        optionals.min = field.min
        optionals.max = field.max
      }
      // Optional field 'options' is supported
      if (field.type === 'select') {
        // Contains required field 'options'
        if (!_.has(field, 'options')) {
          out.error.push(`Missing required property 'options', in field #${i}`)
          continue
        }
        // Field 'options' is array
        if (!_.isArray(field.options)) {
          out.error.push(`Property 'options' must be an array, in field #${i}`)
          continue
        }
        // Field 'options' contains valid entries
        let optionsErrorFlag = false
        for (let i in field.options) {
          const option = field.options[i]
          if (!_.has(option, 'label') || !_.has(option, 'value') || !_.isString(option.label)) {
            optionsErrorFlag = true
            break
          }
        }
        if (optionsErrorFlag === true) {
          out.error.push(`Property 'options' contains malformed entries, in field #${i}`)
          continue
        }

        // Add select options
        optionals.options = field.options
      }

      out.variables.push({
        type: field.type.toLowerCase(),
        name: field.name,
        label: field.label,
        ...optionals
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
