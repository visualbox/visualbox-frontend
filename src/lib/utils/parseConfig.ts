import isArray from 'lodash-es/isArray'
import isString from 'lodash-es/isString'
import isNumber from 'lodash-es/isNumber'
import has from 'lodash-es/has'

interface IParsedConfig {
  error: string[]
  variables: IObject[]
}

const VALID_TYPES: string[] = [
  'text',
  'password',
  'color',
  'switch',
  'slider',
  'select',
  'date'
]

/**
 * Parse JSON configuration string
 * @param  {Array}         config Configuration array
 * @return {IParsedConfig}        Return an object with parsed config and error message(s)
 */
export default (config: IObject): IParsedConfig => {
  try {

    // Config is array
    if (!isArray(config))
      return {
        error: ['Config definition is not an array.'],
        variables: []
      }

    const out: IParsedConfig = {
      error: [],
      variables: []
    }

    for (const i in config) {
      if (!config.hasOwnProperty(i))
        continue

      const field = config[i]

      // Contains required field 'type'
      if (!has(field, 'type')) {
        out.error.push(`Missing required property 'type', in field #${i}`)
        continue
      }
      // Field 'type' is string
      if (!isString(field.type)) {
        out.error.push(`Property 'type' must be a string, in field #${i}`)
        continue
      }
      // Field 'type' is supported
      if (!VALID_TYPES.includes(field.type.toLowerCase())) {
        out.error.push(`Property 'type' has an invalid value: '${field.type}', in field #${i}`)
        continue
      }
      // Contains required field 'name'
      if (!has(field, 'name')) {
        out.error.push(`Missing required property 'name', in field #${i}`)
        continue
      }
      // Field 'name' is string
      if (!isString(field.name)) {
        out.error.push(`Property 'name' must be a string, in field #${i}`)
        continue
      }
      // Field 'name' is unique
      if (out.variables.findIndex(v => v.name === field.name) > -1) {
        out.error.push(`Property 'name' must be unique, in field #${i}`)
        continue
      }
      // Contains required field 'label'
      if (!has(field, 'label')) {
        out.error.push(`Missing required property 'label', in field #${i}`)
        continue
      }
      // Field 'label' is string
      if (!isString(field.label)) {
        out.error.push(`Property 'label' must be a string, in field #${i}`)
        continue
      }

      const optionals: IObject = {}

      // Optional field 'default' is supported
      if (has(field, 'default'))
        optionals.default = field.default
      // Optional fields 'min' and 'max' is supported
      if (field.type === 'slider') {
        // Contains required field 'min'
        if (!has(field, 'min')) {
          out.error.push(`Missing required property 'min', in field #${i}`)
          continue
        }
        // Field 'min' is number
        if (!isNumber(field.min)) {
          out.error.push(`Property 'min' must be a number, in field #${i}`)
          continue
        }
        // Contains required field 'max'
        if (!has(field, 'max')) {
          out.error.push(`Missing required property 'max', in field #${i}`)
          continue
        }
        // Field 'max' is number
        if (!isNumber(field.max)) {
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
        if (!has(field, 'options')) {
          out.error.push(`Missing required property 'options', in field #${i}`)
          continue
        }
        // Field 'options' is array
        if (!isArray(field.options)) {
          out.error.push(`Property 'options' must be an array, in field #${i}`)
          continue
        }
        // Field 'options' contains valid entries
        let optionsErrorFlag = false
        for (const j in field.options) {
          if (!field.options.hasOwnProperty(j))
            continue

          const option = field.options[j]
          if (!has(option, 'label') || !has(option, 'value') || !isString(option.label)) {
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
