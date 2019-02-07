import { squash } from 'butternut'

export default (options) => {
  return {
    name: 'rollup-plugin-butternut',
    renderChunk (code) {
      return squash(code, options)
    }
  }
}
