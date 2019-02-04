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
        @click="freeze = !!!freeze"
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
      :error="item.error"
    ) {{ item.line }}
</template>

<script>
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'
import { mapState, mapMutations } from 'vuex'
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
    ...mapState('Project', ['files', 'layoutHelper']),
    parsedConfig () {
      const contents = fileContents(this.files, ['config.json'])
      if (!contents)
        return { error: ['Unable to parse widget configuration'] }

      return parseConfig(contents)
    }
  },
  watch: {
    parsedConfig: {
      immediate: true,
      deep: true,
      handler () {
        try {
          // Create local config model
          this.model = this.parsedConfig.variables.reduce((acc, cur) => {
            acc[cur.name] = cur.default || null
            return acc
          }, {})
        } catch (e) {}
      }
    },
    model: {
      handler: debounce(function () {
        this.restartWorker()
      }, process.env.VUE_APP_COMMIT_DEBOUNCE),
      deep: true
    },
    files: {
      immediate: true,
      deep: true,
      handler: debounce(function () {
        this.restartWorker()
      }, process.env.VUE_APP_COMMIT_DEBOUNCE)
    },
    freeze (val) {
      if (!val)
        this.restartWorker()
      else {
        if (this.worker !== null)
          this.worker.terminate()
      }
    }
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_SET_HELPER_LAYOUT',
      'PROJECT_SET_HELPER'
    ]),
    forceRestart () {
      this.freeze = false
      this.restartWorker()
    },
    async restartWorker () {
      if (this.freeze)
        return

      this.consoleBuffer = []
      this.consoleBufferAdd('Restarting...')
      try {
        if (this.worker !== null) {
          this.worker.terminate()
          this.worker = null
        }

        const files = get(this, 'files', null)
        const config = this.model

        // Create worker and hook onmessage/onerror callback
        this.worker = await BuildWorker(files, config)

        // Failed to start worker
        if (!this.worker) {
          this.onerror(new Error('Failed to start Web Worker'))
        } else {
          this.worker.onmessage = this.onmessage
          this.worker.onerror = this.onerror
        }
      } catch (e) {
        console.log(e)
        this.onerror(new Error('Failed to start Web Worker'))
      }
    },
    consoleBufferAdd (i, error = false) {
      if (this.consoleBuffer.length > BUFFER_MAX)
        this.consoleBuffer.pop()
      this.consoleBuffer.unshift({
        timestamp: +new Date(),
        error,
        line: i
      })
    },
    onmessage ({ data }) {
      this.consoleBufferAdd(data)
    },
    onerror (e) {
      // e.preventDefault()
      const { message, lineno, colno } = e
      const lines = lineno && colno ? `:${lineno}:${colno}` : ''
      this.consoleBufferAdd(`Error: ${message}${lines}`, true)
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
      padding 5px 6px
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
    top 30px; right 0; left 0; bottom 0;
    overflow auto

    &[active]
      visibility visible

    .ln
      font-family monospace
      word-break break-all

      &[error]
        color red
</style>
