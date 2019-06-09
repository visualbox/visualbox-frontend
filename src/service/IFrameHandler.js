import get from 'lodash-es/get'
import { BuildIFrame, DashboardHandler } from '@/service'

class IFrameHandler {
  attachStore (store) {
    this.store = store
    this.refs = null
    this.isPublicDashboard = false
  }

  /**
   * Configure IFrame handler instance so
   * that widget source is fetched from
   * correct Vuex module for public dashboards.
   * Significant in this.widgets and this.widgetSourceMap().
   */
  makePublicDashboard () {
    this.isPublicDashboard = true
  }

  attachRefs (refs) {
    this.refs = refs
  }

  /**
   * Convenience store mappers.
   */
  get widgets () {
    return this.isPublicDashboard
           ? this.store.state.Public.loaded.widgets
           : this.store.state.Dashboard.loaded.widgets
  }

  /**
   * Get correct source map based on
   * version. Version: '^' means the
   * widget is local and needs to be
   * fetched from store.
   */
  widgetSourceMap (id, version) {
    // Public dashboard, exception.
    if (this.isPublicDashboard) {
      const hash = `${id}:${version}`
      return this.store.state.Public.widgetSourceMap[hash]
    }

    // Local, fetch from store
    if (version === '^') {
      return this.store.getters['Widget/sourceMapById'](id)

    // Registry, fetch from source map
    } else {
      const hash = `${id}:${version}`
      return this.store.state.Dashboard.widgetSourceMap[hash]
    }
  }

  /**
   */
  generate (widgets) {
    widgets.forEach(widget => {
      try {
        // Get source code and config vars from widget
        const { i, id, version, model, settings: { source } } = widget

        const code = this.widgetSourceMap(id, version)

        // Create iframe content with injected config vars
        this.refs[i][0].src = BuildIFrame(code, model)
        
        /**
         * Try to send initial data when the
         * IFrame is loaded.
         */
        this.refs[i][0].addEventListener('load', () => {
          this.onDataSourceChange(i, source)
        })
      } catch (e) {
        console.log('Failed to generate a widget', e)
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
  onDataChange (i, data) {
    const len = i.length

    this.widgets.forEach(widget => {
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
        console.warn('Failed to send updated data to widget', e)
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
      const value = get(DashboardHandler.data, source, null)

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
