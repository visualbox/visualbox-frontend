<template lang="pug">
#helper-integration
  v-system-bar
    //- Tabs
    .tab(:active="tab === 0" @click="tab = 0") Configure
    .tab(:active="tab === 1" @click="tab = 1") Console

    //- Clear console
    tooltip(text="Clear Console" :open-delay="800" top)
      v-icon.ml-2(@click="clear" color="red") mdi-cancel

    //- Restart
    tooltip(text="Restart" :open-delay="800" top)
      v-icon(@click="restart" color="yellow") mdi-restart

    v-spacer
    
    //- Freeze
    tooltip(text="Freeze Console" :open-delay="800" top)
      v-icon(
        :color="freeze ? 'blue' : ''"
        @click="freeze = !freeze"
      ) mdi-snowflake

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

  //- Config pane
  .pane(:active="tab === 0")
    input-types(
      v-model="model"
      :config="config"
    )

  //- Console pane
  .pane(:active="tab === 1" ref="terminal")
    .ln(
      v-for="(item, index) in consoleBuffer"
      :key="index"
    )
      //- template(v-if="item.status")
        b.mr-1(:style="{ 'color': item.status.color }") {{ item.status.text }}
      pre(:style="{ 'color': item.status.color || 'white' }") {{ item.ln }}
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import IO from '@/lib/socket'
import API from '@/service/API'
import { InputTypes, Tooltip } from '@/components'
import { parseConfig } from '@/lib/utils'

const BUFFER_MAX = 100

const T_INFO = 'T_INFO'
const T_WARNING = 'T_WARNING'
const T_ERROR = 'T_ERROR'
const T_OUTPUT = 'T_OUTPUT'
const T_TICK = 'T_TICK'

export default {
  name: 'HelperContainer',
  components: {
    InputTypes,
    Tooltip
  },
  data: () => ({
    tab: 1,
    model: {},
    modelDirty: false,
    consoleBuffer: [],
    freeze: false,
    token: null,
    tick: null
  }),
  computed: {
    ...mapGetters('Integration', ['configMapById']),
    ...mapState('Project', [
      'layoutHelper',
      'dirty',
      'files',
      'id'
    ]),
    config () {
      const configMap = this.configMapById(this.id)

      // Something went wrong retieving local config map
      if (!configMap || typeof configMap === 'string') {
        const error = !configMap ? 'Unable to get config.json' : configMap
        return {
          error: [error],
          variables: []
        }
      }

      return parseConfig(configMap)
    },
    integration () {
      return {
        i: '_0', // Dummy 'i' in helper
        id: this.id,
        version: '^', // always local in helper
        model: this.model
      }
    }
  },
  watch: {
    /**
     * Re-apply defaults to model bound to input types.
     */
    config: {
      immediate: true,
      deep: true,
      handler () {
        const variables = get(this.config, 'variables', [])
        const defaults = variables.reduce((acc, cur) => {
          acc[cur.name] = cur.default || null
          return acc
        }, {})

        // Apply user input
        for (const name in this.model) {
          if (defaults.hasOwnProperty(name))
            defaults[name] = this.model[name]
        }

        this.model = defaults
      }
    },

    model: {
      deep: true,
      handler () {
        this.modelDirty = true
      }
    },

    /**
     * Watch to see if model was dirty and changed
     * "back" to console. If so, restart container.
     */
    tab (val) {
      if (val === 1 && this.modelDirty) {
        this.modelDirty = false
        this.print('model was changed', T_INFO)
        this.restart()
      }
    },

    freeze (val) {
      if (val)
        this.terminate()
      else
        this.restart()
    }
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_SET_HELPER_LAYOUT',
      'PROJECT_SHOW_HELPER'
    ]),

    scrollTerminal () {
      const el = this.$refs.terminal
      if (!el)
        return

      if (el.scrollTop === (el.scrollHeight - el.offsetHeight)) {
        this.$nextTick(() => {
          el.scrollTop = el.scrollHeight
        })
      }
    },

    /**
     * Print a line to the console.
     */
    print (ln, statusType) {
      if (statusType === T_TICK)
        return

      if (this.consoleBuffer.length > BUFFER_MAX)
        this.consoleBuffer.shift()

      let status = null
      if (statusType === T_INFO)
        status = { text: '[info]:', color: 'green' }
      else if (statusType === T_WARNING)
        status = { text: '[warning]:', color: 'orange' }
      else if (statusType === T_ERROR)
        status = { text: '[error]:', color: 'red' }
      else if (statusType === T_OUTPUT)
        status = { text: '[output]:', color: 'deepskyblue' }

      this.consoleBuffer.push({
        timestamp: +new Date(),
        ln, status
      })

      this.scrollTerminal()
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

      IO.emit('message', message)
    },

    /**
     * Restart container.
     */
    restart () {
      this.print('restarting container', T_INFO)
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
      const { type } = m

      switch (type) {

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
          this.print(m.data, T_OUTPUT)
          break;

        case 'STATUS':
          this.print(m.data, m.statusType)
          break;
      }
    },

    /**
     * Init container socket connection.
     */
    initSocket () {
      IO.reset()

      if (!this.token)
        throw new Error('[DashboardHandler]: No token to subscribe to')

      IO.join(this.token)
      IO.on('message', m => this.onMessage(m))

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
      this.print('starting container', T_INFO)

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
    IO.end()

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

  >>> .v-system-bar
    margin 0
    padding 0
    height 30px !important
    background rgba(255, 255, 255, .2)

    .tab
      padding 5px 6px 4px
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
