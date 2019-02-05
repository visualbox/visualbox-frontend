import get from 'lodash-es/get'
import union from 'lodash-es/union'
import { fileContents } from '@/lib/utils/projectUtils'
// import { transform } from '@babel/standalone'

declare global {
  interface Window {
    BlobBuilder: any
    WebKitBlobBuilder: any
    MozBlobBuilder: any
    webkitURL: any
  }
}

const getDependencies = (loaded: IObject) => {
  const dependencies = get(loaded, 'package.dependencies', null)
  const resDependencies = get(loaded, 'resDependencies', null)
  const deps = Object.keys(dependencies).map(k => `${k}@${dependencies[k]}`)
  return union(resDependencies, deps)
}

/**
 * Build a Web Worker for an integration.
 * @param  {String} source Integration source code
 * @param  {Object} config Integration configuration
 * @return {Worker}        New Web Worker
 */
export default async (files: IObject, config: IObject) => {
  if (!files)
    return null

  const source = fileContents(files, ['index.js'])
  if (!source)
    return null

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

  let configStr = '{}'
  try {
    configStr = JSON.stringify(config)
  } catch (e) {
    console.log(e)
  }
  const code = `
    const CONFIG = ${configStr};
    ${source}
  `
  // console.log(code)

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
