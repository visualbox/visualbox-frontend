/**
 * Build a Web Worker for an integration.
 * @param  {String} source Integration source code
 * @param  {Object} config Integration configuration
 * @return {Worker}        New Web Worker
 */
export default (source, config) => {
  // Compile code template
  try {
    config = JSON.stringify(config)
  } catch (e) {
    config = '{}'
  }
  const code = `
    const CONFIG = ${config};
    ${source}
  `

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
