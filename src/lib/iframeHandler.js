import * as _ from 'lodash'

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
        let DATA = null;

        window.addEventListener('message', function (event) {
          try {
            if (typeof event.data == 'object' && event.data.call=='sendConfig') {
              CONFIG = event.data.value;

              if (typeof onMessage === 'function') {
                onMessage({
                  type: 'CONFIG_CHANGED',
                  value: event.data.value
                })
              }
            }
            if (typeof event.data == 'object' && event.data.call=='sendData') {
              DATA = event.data.value;

              if (typeof onMessage === 'function') {
                onMessage({
                  type: 'DATA_CHANGED',
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

  /**
   * Call whenever data object is changed.
   * Widgets sources may have gotten another value.
   * @param {Array} widgets Widget list.
   * @param {Object} data   Updated data source.
   */
  onDataChange (widgets, data) {
    widgets.forEach(w => {
      try {
        const { source } = w.settings
        const value = _.get(data, source, null)

        if (value !== null)
          this.postMessage('sendData', w.i, value)
      } catch (e) {
        console.warning('Failed to send updated data to widgets', e)
      }
    })
  }

  /**
   * Called when a source of a widget has changed
   * and the updated data value need to be sent to IFrame.
   * @param {*} widget Widget list.
   * @param {*} data   Updated data source.
   */
  onDataSourceChange (widget, data) {
    try {
      const { source } = widget.settings
      const value = _.get(data, source, null)

      if (value !== null)
        this.postMessage('sendData', widget.i, value)
    } catch (e) {
      console.warning('Failed to send updated data to widget', e)
    }
  }

  /**
   * Send a message to an IFrame.
   * @param {String} call sendConfig|sendData
   * @param {String} i    Widget dashboard index
   * @param {*} value     Value to be sent
   */
  postMessage (call, i, value) {
    try {
      this.refs[i][0].contentWindow.postMessage({ call, value }, '*')
    } catch (e) {}
  }
}

export default new IFrameHandler()
