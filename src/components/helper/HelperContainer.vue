<template lang="pug">
#helper-integration
  v-system-bar
    //- Tabs
    .tab(:active="tab === 0" @click="tab = 0") Configure
    .tab(:active="tab === 1" @click="tab = 1") Console

    //- Clear console
    tooltip(text="Clear Console" :open-delay="800" top)
      v-icon.ml-2(@click="clear" color="red") mdi-cancel

    v-spacer

    //- Restart
    tooltip(text="Restart" :open-delay="800" top)
      v-icon(@click="restart") mdi-restart
    
    //- Freeze
    tooltip(text="Freeze Console" :open-delay="800" top)
      v-icon(
        :color="freeze ? 'blue' : ''"
        @click="freeze = !freeze"
      ) mdi-snowflake

    //- Dock bottom
    tooltip(text="Dock to Bottom" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'horizontal' ? 'primary' : ''"
        @click="PROJECT_SET_HELPER_LAYOUT('horizontal')"
      ) mdi-page-layout-footer

    //- Dock right
    tooltip(text="Dock to Right" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'vertical' ? 'primary' : ''"
        @click="PROJECT_SET_HELPER_LAYOUT('vertical')"
      ) mdi-page-layout-sidebar-right

    //- Close helper
    v-icon(@click="PROJECT_SHOW_HELPER(false)") mdi-close

  //- Config pane
  .pane(:active="tab === 0")
    input-types(
      v-model="model"
      :config="config"
    )

  //- Console pane
  .pane(:active="tab === 1")
    .ln(
      v-for="(item, index) in consoleBuffer"
      :key="index"
    )
      template(v-if="item.status")
        b.mr-1(:style="{ 'color': item.status.color }") {{ item.status.text }}
      pre {{ item.ln }}
</template>

<script>
import debounce from 'lodash-es/debounce'
import { mapState, mapMutations, mapActions } from 'vuex'
import PubNub from '@/lib/pubnub'
import API from '@/service/API'
import { InputTypes, Tooltip } from '@/components'
import { parseConfig } from '@/lib/utils'

const BUFFER_MAX = 100
const T_INFO = 'T_INFO'
const T_WARNING = 'T_WARNING'
const T_ERROR = 'T_ERROR'

export default {
  name: 'HelperContainer',
  components: {
    InputTypes,
    Tooltip
  },
  data: () => ({
    tab: 1,
    model: {},
    consoleBuffer: [],
    freeze: false,
    token: null,
    tick: null
  }),
  computed: {
    ...mapState('Dashboard', ['integrationConfigMap']),
    ...mapState('Project', [
      'layoutHelper',
      'dirty',
      'files',
      'id'
    ]),
    config () {
      const hash = `${this.id}:*`
      return parseConfig(this.integrationConfigMap[hash])
    },
    integration () {
      return {
        i: '_0', // Dummy 'i' in helper
        id: this.id,
        version: '*', // always latest in helper
        model: this.model
      }
    }
  },
  watch: {
    freeze (val) {
      if (val)
        this.terminate()
      else
        this.restart()
    },
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_SET_HELPER_LAYOUT',
      'PROJECT_SHOW_HELPER'
    ]),

    /**
     * Print a line to the console.
     */
    print (ln, statusType) {
      if (this.consoleBuffer.length > BUFFER_MAX)
        this.consoleBuffer.shift()

      let status = null
      if (statusType === T_INFO)
        status = { text: '[info]:', color: 'green' }
      if (statusType === T_WARNING)
        status = { text: '[warning]:', color: 'orange' }
      if (statusType === T_ERROR)
        status = { text: '[error]:', color: 'red' }

      this.consoleBuffer.push({
        timestamp: +new Date(),
        ln, status
      })
    },

    /**
     * Clear the console.
     */
    clear () {
      this.consoleBuffer = []
    },

    /**
     * Send a message to the container.
     */
    publish (message) {
      if (!this.token)
        throw new Error('[DashboardHandler]: No token to publish to')

      PubNub.publish({
        message,
        channel: [this.token],
        storeInHistory: false
      })
    },

    /**
     * Restart container.
     */
    restart () {
      this.freeze = false
      this.publish({
        type: 'START',
        integration: this.integration
      })
    },

    /**
     * Terminate container.
     */
    terminate () {
      this.publish({
        type: 'TERMINATE',
        i: -1
      })
    },

    /**
     * The container has sent a message.
     */
    onMessage (m) {
      switch (m.message.type) {

        /**
         * Container sent an INIT message.
         */
        case 'INIT':
          this.print('container started', T_INFO)
          break

        /**
         * Container integration is giving output.
         * 'i' is included in the message but we
         * don't care about it in the helper
         * component.
         */
        case 'OUTPUT':
          const { i, data } = m.message
          this.print(data)
          break;

        case 'STATUS':
          this.print(m.message.data, m.message.statusType)
          break;
      }
    },

    /**
     * Init container socket connection.
     */
    initSocket () {
      PubNub.unsubscribeAll()

      if (!this.token)
        throw new Error('[DashboardHandler]: No token to subscribe to')

      PubNub.subscribe({
        channels: [this.token],
        withPresence: true
      })

      PubNub.addListener({
        message: m => { this.onMessage(m) }
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
    },

    /**
     * Init container by calling LTL.
     */
    async initContainer () {
      this.clear()

      try {
        const { token } = await API.invoke('post', '/containers/ltl', {
          body: { integrations: [this.integration] }
        })

        this.token = token
        this.initSocket()
      } catch (e) {
        console.log('[DashboardHandler]: error; ', e)
      }
    }
  },
  mounted () {
    this.initContainer()
  },
  beforeDestroy () {
    this.publish({ type: 'TERMINATE' })
    PubNub.unsubscribeAll()

    if (this.tick !== null)
      clearInterval(this.tick)
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#helper-integration
  height 100%
  background #000

  .v-system-bar
    margin 0
    padding 0
    height 30px !important
    background rgba(255, 255, 255, .2)

    .tab
      padding 5px 6px 4px
      display inline-block
      cursor pointer

      &[active]
        color white
        background #000

    // Place above gutter overlay
    .tab, .v-tooltip, .v-icon
      z-index 25

    .v-icon
      margin-right 10px

  .pane
    display none
    padding 16px
    position absolute
    top 31px; right 0; left 0; bottom 0;
    overflow auto

    &[active]
      display block

    .ln
      font-family monospace

      b
        float left

      pre
        white-space pre-wrap
        white-space -moz-pre-wrap
        white-space -pre-wrap
        white-space -o-pre-wrap
        word-wrap break-word
        word-break break-word
</style>