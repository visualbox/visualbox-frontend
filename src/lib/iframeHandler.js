
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
      // Get source code and config vars from widget
      const { source } = this.widgetById(w.id)
      const { config } = w.settings

      // Create injectable JS code containing config vars
      const injected = `
      <script type="text/javascript">
        let CONFIG = ${JSON.stringify(config)};
        window.addEventListener('message', function (event) {
          try {
            if (typeof event.data == 'object' && event.data.call=='sendValue') {
              CONFIG = event.data.value;

              if (typeof onMessage === 'function') {
                onMessage({
                  type: 'CONFIG_CHANGED',
                  value: event.data.value
                })
              }
            }
          } catch (e) {
            consol.error('Widget error:', e);
          }
        }, false);
      </script>`

      // Create iframe content with injected config vars
      const html = injected + source
      this.refs[w.i][0].src = `data:text/html,${encodeURIComponent(html)}`
    })
  }

  postMessage (i, value) {
    try {
      this.refs[i][0].contentWindow.postMessage({
        call: 'sendValue',
        value
      }, '*')
    } catch (e) {
      console.log('FAIL', e)
    }
  }
}

export default new IFrameHandler()
