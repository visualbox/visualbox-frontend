import getNestedSource from '@/lib/getNestedSource'
import buildIframe from '@/lib/buildIframe'

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
      // ^ fetch package to get deps for widget

      // Create iframe content with injected config vars
      this.refs[w.i][0].src = buildIframe(source, config)
    })
  }

  /**
   * Call whenever data object is changed.
   * Widgets sources may have gotten another value.
   * @param {Array} widgets Widget list.
   * @param {Object} data   Updated data source.
   */
  onDataChange (widgets, data) {
    widgets.forEach(widget => {
      this.onDataSourceChange(widget, data)
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

      // Widget has no source
      if (!source)
        return

      // const value = _.get(data, source, null)
      const value = getNestedSource(data, source.split('.'))

      if (value !== null)
        this.postMessage('sendData', widget.i, value)
    } catch (e) {
      console.warn('Failed to send updated data to widget', e)
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
