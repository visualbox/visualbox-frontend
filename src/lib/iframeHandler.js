
class IFrameHandler {
  constructor () {
    this.widgetById = null
    this.refs = null
  }

  init (widgetById, refs) {
    this.widgetById = widgetById
    this.refs = refs
  }

  generate (widgets) {
    widgets.forEach(w => {
      // Get ID, source code and config vars from widget
      const { id, source } = this.widgetById(w.id)
      const { config } = w.settings

      // Create injectable JS code containing config vars
      const injected = `const CONFIG = ${JSON.stringify(config)};`

      // Create iframe content with injected config vars
      const html = source
      this.refs[w.i][0].src = `data:text/html,${encodeURIComponent(html)}`
    })
  }
}

export default new IFrameHandler()
