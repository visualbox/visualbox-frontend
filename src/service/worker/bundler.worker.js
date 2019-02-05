import * as rollup from 'rollup/dist/rollup.browser'
import virtual from './virtual.rollup.plugin'
import buble from 'rollup-plugin-buble'
import butternut from 'rollup-plugin-butternut'

const isEntryFile = name => {
  return [
    'index.js',
    'main.js'
  ].includes(name)
}

let entryIsFound = false
let modules = {}
let warnings = []

onmessage = async ({ data }) => {
  try {
    const { type, payload } = data

    switch (type) {
      /**
       * READY
       * Clean up everything (abort?).
       */
      case 'READY':
        entryIsFound = false
        modules = {}
        warnings = []
        break

      /**
       * ADD_MODULE
       * Add incoming module to module collection.
       */
      case 'ADD_MODULE':
        const { fullPath } = payload
        if (!fullPath)
          return

        const { contents } = payload
        modules[fullPath] = {
          name: fullPath,
          code: contents,
          isEntry: entryIsFound ? false : isEntryFile(fullPath)
        }
        // console.warn('[Bundler]: loaded module', modules[fullPath])
        break

      /**
       * BUNDLE
       * Start the bundle process.
       */
      case 'BUNDLE':
        const inputOptions = {
          input: 'index.js', // Entry file
          plugins: [
            virtual(modules),
            buble(),
            butternut()
          ],
          onwarn (warning) {
            warnings.push(warning)
            console.group(warning.loc ? warning.loc.file : '')
            console.warn(warning.message)
            if (warning.frame)
              console.log(warning.frame)
            if (warning.url)
              console.log(`See ${warning.url} for more information`)
            console.groupEnd()
          }
        }

        const outputOptions = {
          format: 'iife',
          name: 'main',
          //? file: 'output.js',

          globals: {},
          compact: true,
          sourcemap: 'inline',
          sourcemapExcludeSources: true
        }

        const result = await (await rollup.rollup(inputOptions)).generate(outputOptions)
        postMessage({
          type: 'BUNDLE_READY',
          payload: result.output[0].code
        })
        break
      default:
        postMessage({
          type: 'ERROR',
          payload: `[Bundler]: unknown message type "${type}"`
        })
    }

  } catch (e) {
    postMessage({
      type: 'ERROR',
      payload: `[Bundler]: error: ${e.message}`
    })
  }
}
