<template lang="pug">
#helper-integration
  v-system-bar
    .tab(
      :active="tab === 0"
      @click="tab = 0"
    ) Configure
    .tab(
      :active="tab === 1"
      @click="tab = 1"
    ) Console
    tooltip(text="Clear Console" :open-delay="800" top)
      v-icon.ml(
        @click="consoleBuffer = []"
        color="red"
      ) mdi-cancel
    v-spacer
    tooltip(text="Restart" :open-delay="800" top)
      v-icon(@click="forceRestart") mdi-restart
    tooltip(text="Freeze Console" :open-delay="800" top)
      v-icon(
        :color="freeze ? 'blue' : ''"
        @click="freeze = !freeze"
      ) mdi-snowflake
    tooltip(text="Dock to Bottom" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'horizontal' ? 'primary' : ''"
        @click="PROJECT_SET_HELPER_LAYOUT('horizontal')"
      ) mdi-page-layout-footer
    tooltip(text="Dock to Right" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'vertical' ? 'primary' : ''"
        @click="PROJECT_SET_HELPER_LAYOUT('vertical')"
      ) mdi-page-layout-sidebar-right
    v-icon(@click="PROJECT_SET_HELPER(false)") mdi-close
  .pane(:active="tab === 0")
    input-types(
      v-model="model"
      :config="parsedConfig"
    )
  .pane(:active="tab === 1")
    .ln(
      v-for="(item, index) in consoleBuffer"
      :key="index"
      :style="{ 'color': item.color }"
    ) {{ item.ln }}
</template>

<script>
import debounce from 'lodash-es/debounce'
import { mapState, mapMutations, mapActions } from 'vuex'
import { InputTypes, Tooltip } from '@/components'
import { parseConfig } from '@/lib/utils'
import { fileContents } from '@/lib/utils/projectUtils'
import { BuildWorker } from '@/service'

const BUFFER_MAX = 100

export default {
  name: 'HelperIntegration',
  components: {
    InputTypes,
    Tooltip
  },
  data: () => ({
    model: {},
    tab: 1,
    worker: null,
    consoleBuffer: [],
    freeze: false
  }),
  computed: {
    ...mapState('Project', ['layoutHelper', 'dirty', 'files']),
    ...mapState('Bundler', ['active', 'status']),
    parsedConfig () {
      const contents = fileContents(this.files, ['config.json'])
      if (!contents)
        return { error: ['Unable to parse integration configuration'] }
      return parseConfig(contents)
    }
  },
  watch: {
    /**
     * Re-apply defaults to model bound to input types.
     */
    parsedConfig: {
      immediate: true,
      deep: true,
      handler () {
        if (!this.parsedConfig.hasOwnProperty('variables'))
          return

        try {
          // Create local config model
          this.model = this.parsedConfig.variables.reduce((acc, cur) => {
            acc[cur.name] = cur.default || null
            return acc
          }, {})
        } catch (e) {
          console.log(e)
        }
      }
    },
    dirty: {
      immediate: true,
      handler: debounce(function () {
        this.fetchBundle()
      }, 3000)
    },
    freeze (val) {
      if (!val)
        this.fetchBundle()
      else {
        if (this.worker !== null)
          this.worker.terminate()
      }
    },
    // Wather for model? so that config changes will take effect
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_SET_HELPER_LAYOUT',
      'PROJECT_SET_HELPER'
    ]),
    ...mapActions('Project', ['save']),
    ...mapActions('Bundler', ['queueBundle']),

    /**
     * Print a line to the console.
     */
    println (ln, color = '#FFF') {
      if (this.consoleBuffer.length > BUFFER_MAX)
        this.consoleBuffer.shift()
      this.consoleBuffer.push({
        timestamp: +new Date(),
        ln,
        color
      })
    },

    forceRestart () {
      this.freeze = false
      this.fetchBundle()
    },

    async startWorker (code) {
      // Clear console
      this.consoleBuffer = []
      this.println('Restarting...')

      try {
        // Terminate already running worker
        if (this.worker !== null)
          this.worker.terminate()

        this.worker = await BuildWorker(code, this.model) // Possibly injectable?
        if (!this.worker)
          throw new Error('Web Worker was not created')

        this.consoleBuffer = []

        // Hook worker messages
        this.worker.onmessage = ({ data }) => this.println(data)
        this.worker.onerror = e => {
          const { message, lineno, colno } = e
          const lines = lineno && colno ? `:${lineno}:${colno}` : ''
          this.println(`Error: ${message}${lines}`, 'red')
        }
      } catch (e) {
        this.println(`Failed to start: ${e.message}`, 'red')
      }
    },

    async fetchBundle () {
      if (this.freeze)
        return

      try {
        this.queueBundle({
          project: await this.save(false),
          cb: (err, code) => {
            console.log(code)
            if (err) {
              this.println(err, 'red')
              return
            }
            this.startWorker(code)
          }
        })
      } catch (e) {
        console.log('Mount bundle error', e)
      }
    }
  },
  beforeDestroy () {
    if (this.worker !== null)
      this.worker.terminate()
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

      &.ml
        margin-left 10px

  .pane
    visibility hidden
    padding 16px
    position absolute
    top 31px; right 0; left 0; bottom 0;
    overflow auto

    &[active]
      visibility visible

    .ln
      font-family monospace
      word-break break-all
</style>
