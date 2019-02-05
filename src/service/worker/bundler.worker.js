import * as rollup from 'rollup/dist/rollup.browser'
import virtual from './virtual.rollup.plugin'
import nodent from 'rollup-plugin-nodent'
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

onerror = () => {
  console.log('There is an error inside your worker!')
}

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
            // async/await
            nodent({
              promises: true,
              noRuntime: true
            }),
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

        const bundle = await rollup.rollup(inputOptions)
        const result = await bundle.generate(outputOptions)
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
