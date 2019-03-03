import API from '@/service/API'
import PubNub from '@/lib/pubnub'
import { IFrameHandler } from '@/service'
import EventBus from '@/lib/eventBus'

class DashboardHandler {
  constructor () {
    this.token = null
    this.tick = null
    this.data = {}
  }

  attachStore (store) {
    this.store = store
  }

  get integrations () {
    return this.store.state.Dashboard.loaded.integrations
  }

  /**
   * The container has sent a message.
   */
  onMessage (m) {
    switch (m.message.type) {

      /**
       * Container sent an INIT message.
       */
      case 'INIT':
        console.log('GOT init', m)
        break

      /**
       * Container integration is giving output.
       * 'i' is included in the message so we
       * know where to send the data.
       */
      case 'OUTPUT':
        const { i, data } = m.message
        this.data[i] = data
        IFrameHandler.onDataChange(i, data)
        console.log(`[${i}]: ${data}`)

        /**
         * Only emit notification to recalculate dataTree
         * if edit widget panel is open.
         */
        if (this.store.state.Dashboard.focusedWidget)
          EventBus.$emit('vbox:dataChanged')
        break;
    }
  }

  onPresence (p) {
    console.log('[PubNub]: onPresence; ', p)
  }

  onStatus (s) {
    console.log('[PubNub]: onStatus; ', s)
  }

  publish (message) {
    if (!this.token)
      throw new Error('[DashboardHandler]: No token to publish to')

    PubNub.publish({
      message,
      channel: [this.token],
      storeInHistory: false
    })
  }

  initSocket () {
    PubNub.unsubscribeAll()

    if (!this.token)
      throw new Error('[DashboardHandler]: No token to subscribe to')

    PubNub.subscribe({
      channels: [this.token],
      withPresence: true
    })

    PubNub.addListener({
      message: m => { this.onMessage(m) },
      presence: p => { this.onPresence(p) },
      status: s => { this.onStatus(s) }
    })

    /**
     * Start ticker to keep container
     * alive.
     */
    if (this.tick !== null)
      clearInterval(this.tick)
    this.tick = setInterval(() => {
      this.publish({ type: 'TICK' })
    }, 15000)
  }

  /**
   * Init dashboard by sending integrations to start
   * to LTL without a token. Save returned token.
   */
  async initDashboard () {
    return
    try {
      const { token } = await API.invoke('post', '/containers/ltl', {
        body: { integrations: this.integrations }
      })

      this.token = token
      this.initSocket()
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

  restartIntegration (integration) {
    this.publish({
      type: 'START',
      integration
    })
  }

  removeIntegration (i) {
    this.publish({ type: 'TERMINATE', i })
  }

  /**
   * End dashboard session by sending the
   * 'END' cmd to container, unsubscribe
   * and clearing token / data.
   */
  end () {
    this.publish({ type: 'TERMINATE' })
    PubNub.unsubscribeAll()
    this.token = null
    this.data = {}

    if (this.tick !== null) {
      clearInterval(this.tick)
      this.tick = null
    }
  }
}

export default new DashboardHandler()