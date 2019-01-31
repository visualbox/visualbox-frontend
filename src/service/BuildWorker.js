import * as _ from 'lodash'
import { transform } from '@babel/standalone'

const getDependencies = loaded => {
  const dependencies = _.get(loaded, 'package.dependencies', null)
  const resDependencies = _.get(loaded, 'resDependencies', null)
  const deps = Object.keys(dependencies).map(k => `${k}@${dependencies[k]}`)
  return _.union(resDependencies, deps)
}

/**
 * Build a Web Worker for an integration.
 * @param  {String} source Integration source code
 * @param  {Object} config Integration configuration
 * @return {Worker}        New Web Worker
 */
export default async (loaded, config) => {
  if (!loaded)
    return new Worker()

  const source = _.get(loaded, 'source', '')
  if (source === '')
    return new Worker()

  /*
  // Resolve external dependencies
  const dependencies = getDependencies(loaded)
  console.log('Gotta get ALL these', dependencies)
  const jobs = dependencies.map(async d => {
    const result = await fetch(`https://unpkg.com/${d}`)
    return result.text()
  })

  let externalSource
  try {
    const result = await Promise.all(jobs)
    externalSource = result.join('')
  } catch (e) {
    console.log(e)
  }
  */

  try {
    config = JSON.stringify(config)
  } catch (e) {
    config = '{}'
  }
  let code = `
    const CONFIG = ${config};
    ${source}
  `
  console.log(code)

  /*
  // Compile code template
  try {
    code = transform(code, { presets: ['es2015'] }).code
  } catch (e) {
    console.log(e)
  }*/

  // Create BLOB
  let blob
  try {
    blob = new Blob([code], { type: 'application/javascript' })
  } catch (e) {
    const BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder
    blob = new BlobBuilder()
    blob.append(code)
    blob = blob.getBlob()
  }

  // Create Object URL
  const URL = window.URL || window.webkitURL
  const blobURL = URL.createObjectURL(blob)

  // Create Worker
  const worker = new Worker(blobURL)

  // Cleanup
  URL.revokeObjectURL(blobURL)

  return worker
}
