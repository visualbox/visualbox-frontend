// import { getNestedSource } from '@/lib/utils'
import get from 'lodash-es/get'
import { fileContents } from '@/lib/utils/projectUtils'
import { BuildIFrame, WorkerHandler } from '@/service'

class IFrameHandler {
  attachStore (store) {
    this.store = store
    this.refs = null
  }

  attachRefs (refs) {
    this.refs = refs
  }

  /**
   * Convenience store mappers.
   */
  widgetById (id) {
    return this.store.getters['Widget/widgetById'](id)
  }

  /**
   * Register integrations by first trying
   * to fetch them from source, and then starting
   * them with configurations from integration.
   * If not found, bundle and repeat.
   */
  generate (widgets) {
    widgets.forEach(widget => {
      try {
        // Get source code and config vars from widget
        const { i, id, settings: { config, source } } = widget

        // BUNDLE?
        const { files } = this.widgetById(id)
        const contents = fileContents(files, ['index.html'])
        if (!contents)
          console.log('Could not read index.html')

        // Create iframe content with injected config vars
        this.refs[i][0].src = BuildIFrame(contents, config)

        // Try to send initial data
        this.onDataSourceChange(i, source)
      } catch (e) {
        console.log('Failed to generate a widget')
      }
    })
  }

  /**
   * Call whenever data object is changed.
   * Widgets sources may have gotten another value.
   * @param {Array} widgets Widget list.
   * @param {Object} i      Dashboard integration ID.
   * @param {Object} data   Updated data object.
   */
  onDataChange (widgets, i, data) {
    const len = i.length

    widgets.forEach(widget => {
      try {
        let { source } = widget.settings

        // Widget has no source
        if (!source)
          return

        /**
         * Widget source does not start on affected
         * data integration i. Early abort.
         */
        const sourceStrStart = source.substr(0, len)
        if (sourceStrStart !== i)
          return

        /**
         * Strip off integration ID from source
         * path since 'data' does not contain
         * that information.
         * Edge case: when source is root,
         * we don't need to do this.
         */
        let value = null
        if (source === i) {
          value = data
        } else {
          source = source.substr(len + 1)
          /**
           * Find new value from updated data.
           */
          value = get(data, source, null)
        }

        if (value !== null)
          this.postMessage('sendData', widget.i, value)

      } catch (e) {
        console.warn('Failed to send updated data to widget bb', e, source)
      }
    })
  }

  /**
   * Called when a source of a widget has changed
   * and the updated data value need to be sent to IFrame.
   * @param {*} i        Dashboard widget ID.
   * @param {*} source   Updated data source path.
   */
  onDataSourceChange (i, source) {
    try {
      // Widget has no source
      if (!i || !source)
        return

      // const value = _.get(data, source, null) getNestedSource was here?
      const value = get(WorkerHandler.data, source, null)

      if (value !== null)
        this.postMessage('sendData', i, value)
    } catch (e) {
      console.warn('Failed to send updated data to widget a', e, source)
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
