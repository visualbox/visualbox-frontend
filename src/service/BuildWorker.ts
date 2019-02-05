declare global {
  interface Window {
    BlobBuilder: any
    WebKitBlobBuilder: any
    MozBlobBuilder: any
    webkitURL: any
  }
}

/**
 * Build a Web Worker for an integration.
 * @param  {String} source Integration source code
 * @param  {Object} config Integration configuration
 * @return {Worker}        New Web Worker
 */
export default async (code: string, config?: IObject) => {
  let configString
  try {
    configString = JSON.stringify(config)
  } catch (e) {
    configString = '{}'
  }

  // Inject stringified CONFIG
  code = `
    const CONFIG = ${configString};
    ${code}
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
