<template lang="pug">
#helper-integration
  v-system-bar
    //- Tabs
    //- .tab(:active="tab === 0" @click="tab = 0") Build
    .tab(active) Console

    //- Clear console
    tooltip(text="Clear Console" :open-delay="800" top)
      v-icon.ml-2(@click="consoleClear" color="red") mdi-cancel

    //- Restart
    tooltip(text="Restart" :open-delay="800" top)
      v-icon(@click="restart" color="yellow") mdi-restart

    //- Build
    tooltip(text="Build" :open-delay="800" top)
      v-icon(@click="startBuild" color="blue") mdi-progress-wrench

    v-spacer

    //- Dock bottom
    tooltip(text="Dock Bottom" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'horizontal' ? 'primary' : ''"
        @click="PROJECT_SET_HELPER_LAYOUT('horizontal')"
      ) mdi-page-layout-footer

    //- Dock right
    tooltip(text="Dock Right" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'vertical' ? 'primary' : ''"
        @click="PROJECT_SET_HELPER_LAYOUT('vertical')"
      ) mdi-page-layout-sidebar-right

    //- Close helper
    v-icon(@click="PROJECT_SHOW_HELPER(false)") mdi-close

  //- Console pane
  .pane(active ref="terminal")
    .ln(
      v-for="(item, index) in consoleBuffer"
      :key="index"
    )
      pre(:style="{ 'color': item.color }") {{ item.ln }}
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapActions } from 'vuex'
import { API, CloudWatchLogs, WS } from '@/service'
import { Tooltip } from '@/components'
import { parseConfig } from '@/lib/utils'

const BUFFER_MAX = 10000

const WSType = {
  TICK: 'TICK',
  INIT: 'INIT',
  TERMINATE: 'TERMINATE',
  INFO: 'INFO',
  OUTPUT: 'OUTPUT',
  WARNING: 'WARNING',
  ERROR: 'ERROR'
}

export default {
  name: 'HelperContainer',
  components: { Tooltip },
  data: () => ({
    consoleBuffer: [],
    token: null
  }),
  computed: {
    ...mapState('Project', [
      'layoutHelper',
      'dirty',
      'files',
      'id'
    ]),
    integration () {
      return {
        i: '_0', // Dummy 'i' in helper
        id: this.id,
        version: '^', // Always local in helper
        model: this.model
      }
    }
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_SET_HELPER_LAYOUT',
      'PROJECT_SHOW_HELPER'
    ]),
    ...mapActions('Integration', ['build']),

    consoleScroll () {
      const el = this.$refs.terminal
      if (!el)
        return

      if (el.scrollTop === (el.scrollHeight - el.offsetHeight)) {
        this.$nextTick(() => {
          el.scrollTop = el.scrollHeight
        })
      }
    },

    consolePrint (ln, wsMessageType) {
      if (wsMessageType === WSType.TICK)
        return

      if (this.consoleBuffer.length > BUFFER_MAX)
        this.consoleBuffer.shift()

      let color
      switch (wsMessageType) {
        case WSType.INFO: color = 'green'; break
        case WSType.WARNING: color = 'orange'; break
        case WSType.ERROR: color = 'red'; break
        case WSType.OUTPUT: color = 'deepskyblue'; break
        default: color = 'white'; break
      }

      this.consoleBuffer.push({
        timestamp: +new Date(),
        color,
        ln
      })
      this.consoleScroll()
    },

    consoleClear () {
      this.consoleBuffer = []
    },

    onMessage ({ type, data }) {
      console.log('onmsg', type, data)
      switch (type) {
        case 'INIT': this.consolePrint('Container started', WSType.INFO); break
        case 'INFO': this.consolePrint(data, WSType.INFO); break
        case 'OUTPUT': this.consolePrint(data, WSType.OUTPUT); break
        case 'WARNING': this.consolePrint(data, WSType.WARNING); break
        case 'ERROR': this.consolePrint(data, WSType.ERROR); break
      }
    },

    restart () {
      this.consolePrint('Restarting container', WSType.INFO)
      this.launch()
    },

    async launch () {
      WS.messageTerminate()
      this.consoleClear()
      this.consolePrint('Starting container', WSType.INFO)

      try {
        const { token } = await API.invoke('post', '/containers/ltl2', {
          body: {
            integrations: [this.integration],
            token: this.token
          }
        })
        WS.join(token, message => {
          this.onMessage(message)
        })
        this.token = token
      } catch (e) {
        console.log('[DashboardHandler]: error; ', e)
      }
    },

    async startBuild () {
      WS.messageTerminate()
      this.consoleClear()
      this.consolePrint('Starting build', WSType.INFO)

      try {
        const { groupName, streamName } = await this.build(this.id)
        CloudWatchLogs.startLoop(
          { groupName, streamName },
          events => {
            events.forEach(({ message }) => this.consolePrint(message, WSType.INFO))
          },
          event => {
            this.consolePrint(event.message, WSType.WARNING)
          }
        )
      } catch (e) {
        console.log(e)
        console.log('FAIL')
        // this.isBuilding = false
      }
    }
  },
  mounted () {
    this.launch()
  },
  beforeDestroy () {
    WS.leave()
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#helper-integration
  height 100%
  background #000

  >>> .v-system-bar
    margin 0
    padding 0
    height 30px !important
    background rgba(255, 255, 255, .2)

    .tab
      padding 5px 8px 4px
      display inline-block
      cursor pointer
      z-index 25

      &[active]
        color white
        background #000

    // Place above gutter overlay
    .tooltip-element, >.v-icon
      height 24px
      margin-right 10px
      z-index 25

  .pane
    display none
    padding 16px
    position absolute
    top 31px; right 0; left 0; bottom 0;
    overflow auto

    &[active]
      display block

    .ln
      font-size 14px
      font-family monospace

      b
        font-weight normal
        float left

      pre
        white-space pre-wrap
        white-space -moz-pre-wrap
        white-space -pre-wrap
        white-space -o-pre-wrap
        word-wrap break-word
        word-break break-word
</style>
