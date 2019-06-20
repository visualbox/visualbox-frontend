<template lang="pug">
#helper-integration
  v-system-bar
    //- Tabs
    //- .tab(:active="tab === 0" @click="tab = 0") Build
    .tab(active) Console

    //- Clear console
    tooltip(text="Clear Console" :open-delay="800" top)
      v-icon.pl-3(@click="consoleClear" color="grey") mdi-cancel

    //- Restart
    tooltip(text="Restart" :open-delay="800" top)
      v-icon(@click="restart" :disabled="isBuilding" color="grey") mdi-restart

    //- Build
    tooltip(text="Build" :open-delay="800" top)
      v-icon(@click="startBuild" :disabled="isBuilding" color="blue") mdi-progress-wrench

    v-spacer

    //- Dock bottom
    tooltip(text="Dock Bottom" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'horizontal' ? 'white' : 'grey'"
        @click="PROJECT_SET_HELPER_LAYOUT('horizontal')"
      ) mdi-page-layout-footer

    //- Dock right
    tooltip(text="Dock Right" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'vertical' ? 'white' : 'grey'"
        @click="PROJECT_SET_HELPER_LAYOUT('vertical')"
      ) mdi-page-layout-sidebar-right

    //- Close helper
    v-icon.pr-3(
      color="grey"
      @click="PROJECT_SHOW_HELPER(false)"
    ) mdi-close

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
import { API, WS } from '@/service'
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
    isBuilding: false
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
      this.consoleClear()
      this.consolePrint('Starting container', WSType.INFO)

      try {
        const { token } = await API.invoke('post', '/containers/ltl2', {
          body: { integrations: [this.integration] }
        })
        WS.join(token, 'client', true, message => this.onMessage(message))
      } catch (e) {
        console.log('[launch]: error:', e)
      }
    },

    async startBuild () {
      this.consoleClear()
      this.consolePrint('Starting build', WSType.INFO)
      this.isBuilding = true

      try {
        const { buildId } = await this.build(this.id)
        WS.join(buildId, 'build', false, message => {
          this.onMessage(message)

          if (message.data.indexOf('visualbox-build-done') !== -1) {
            this.consolePrint('Build is done!', WSType.OUTPUT)
            this.isBuilding = false
          }
        })
      } catch (e) {
        console.log('[startBuild]: error:', e)
        this.isBuilding = false
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
    height 35px !important
    background rgba(255, 255, 255, .2)

    .tab
      padding 6px 15px 8px
      display inline-block
      cursor pointer
      z-index 25

      &[active]
        color white
        background #000

    // Place above gutter overlay
    .tooltip-element, >.v-icon
      z-index 25

    .tooltip-element .v-icon, >.v-icon
      padding 10px 8px 9px

  .pane
    display none
    padding 16px
    position absolute
    top 35px; right 0; left 0; bottom 0;
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
