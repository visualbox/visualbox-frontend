import API from '@/service/API'
import { WS, IFrameHandler } from '@/service'
import EventBus from '@/lib/eventBus'

class DashboardHandler {
  constructor () {
    this.token = null
    this.data = {}
    this.isPublicDashboard = false
  }

  attachStore (store) {
    this.store = store
  }

  /**
   * Configure Dashboard handler instance so
   * that correct Vuex module is chosen.
   * Significant in this.addInitedIntegration().
   */
  makePublicDashboard () {
    this.isPublicDashboard = true
  }

  get integrations () {
    return this.store.state.Dashboard.loaded.integrations
  }

  addInitedIntegration (i) {
    if (this.isPublicDashboard)
      this.store.commit('Public/DASHBOARD_ADD_INITED_INTEGRATION', i)
    else
      this.store.commit('Dashboard/DASHBOARD_ADD_INITED_INTEGRATION', i)
  }

  onMessage ({ type, i, data }) {
    switch (type) {
      case 'INIT': this.addInitedIntegration(i); break

      /**
       * Container integration is giving output.
       * 'i' is included in the message so we
       * know where to send the data.
       */
      case 'OUTPUT':
        try {
          data = JSON.parse(data)
        } catch (e) {}

        this.data[i] = data
        IFrameHandler.onDataChange(i, data)

        /**
         * Only emit notification to recalculate dataTree
         * if edit widget panel is open.
         */
        if (this.store.state.Dashboard.focusedWidget)
          EventBus.$emit('vbox:dataChanged')
        break
    }
  }

  /**
   * Init dashboard by sending integrations to start
   * to LTL without a token. Save returned token.
   */
  async initDashboard () {
    try {
      const { token } = await API.invoke('post', '/containers/ltl', {
        body: { integrations: this.integrations }
      })

      this.token = token
      WS.join(token, 'client', true, message => this.onMessage(message))
    } catch (e) {
      console.log('[DashboardHandler]: error; ', e)
    }
  }

  /**
   * Add an integration by calling LTL
   * with current token and the new integration
   * as a single item in the list.
   */
  async addIntegration (integration) {
    try {
      await API.invoke('post', '/containers/ltl', {
        body: {
          token: this.token,
          integrations: [integration]
        }
      })
    } catch (e) {
      console.log('[DashboardHandler]: error; ', e)
    }
  }

  restartIntegration ({ i, model }) {
    WS.messageRestart({ i, model })
  }

  removeIntegration (i) {
    delete this.data[i]
    WS.messageTerminate(i)
  }

  /**
   * End dashboard session by sending the
   * 'END' cmd to container, unsubscribe
   * and clearing token / data.
   */
  end () {
    WS.leave()
    this.token = null
    this.data = {}
  }
}

export default new DashboardHandler()
