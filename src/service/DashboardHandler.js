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

  setLoadingScreen (show) {
    this.store.dispatch('Dashboard/setLoadingScreen', show)
  }

  /**
   * The container has sent a message.
   */
  onMessage (m) {
    switch (m.message.type) {

      /**
       * Container sent an INIT message,
       * signaling it's ready to start
       * integrations.
       */
      case 'INIT':
        this.setLoadingScreen(false)

        /**
         * Start ticker to keep container
         * alive.
         */
        if (this.tick !== null)
          clearInterval(this.tick)
        this.tick = setInterval(() => {
          this.publish({ type: 'TICK' })
        }, 15000)

        /**
         * Launch initial tasks. No need to
         * add them via LTL first since we're
         * still at init (they are already added
         * to container access).
         */
        const integrations = this.store.state.Dashboard.loaded.integrations.map(({ i, id, version, model }) => {
          return { i, id, version, model }
        })
        this.publish({ type: 'START', integrations })
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
  }

  /**
   * Init dashboard by ID by sending a command
   * to the LTL to download and start a new container
   * with processes and initial configurations.
   */
  async initDashboard (integrationConfigMap) {
    try {
      this.setLoadingScreen(true)
      const {
        token
      } = await API.invoke('post', '/containers/ltl', {
        body: {
          type: 'INIT',
          integrationConfigMap
        }
      })
      this.token = token

      // this.token = '2060044baeb33f73154f43406a463d905b14c317f15924f09df7c7bda498b241bd0b3d89fb3114b6de1b614b8ca9c28bdfeebf6503510a954f1764a4a56b3fdf'
      this.initSocket()
    } catch (e) {
      console.log('[DashboardHandler]: error; ', e)
    }
  }

  addIntegration ({ i, id, version, model }) {
    this.publish({
      type: 'START',
      integrations: [{ i, id, version, model }]
    })
  }

  restartIntegration ({ i, id, version, model }) {
    this.publish({
      type: 'START',
      integrations: [{ i, id, version, model }]
    })
  }

  removeIntegration (i) {
    this.publish({ type: 'REMOVE', i })
  }

  /**
   * End dashboard session by sending the
   * 'END' cmd to container, unsubscribe
   * and clearing token / data.
   */
  end () {
    this.publish({ type: 'END' })
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
