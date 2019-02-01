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
    v-tooltip(
      :open-delay="0"
      :close-delay="0"
      color="black"
      transition="fade-transition"
      top
    )
      span Clear Console
      v-icon.ml(
        @click="consoleBuffer = []"
        slot="activator"
        color="red"
      ) mdi-cancel
    v-spacer
    v-tooltip(
      :open-delay="0"
      :close-delay="0"
      color="black"
      transition="fade-transition"
      top
    )
      span Restart
      v-icon(
        @click="forceRestart"
        slot="activator"
      ) mdi-restart
    v-tooltip(
      :open-delay="0"
      :close-delay="0"
      color="black"
      transition="fade-transition"
      top
    )
      span Freeze Console
      v-icon(
        :color="freeze ? 'blue' : ''"
        @click="freeze = !!!freeze"
        slot="activator"
      ) mdi-snowflake
    v-tooltip(
      :open-delay="0"
      :close-delay="0"
      color="black"
      transition="fade-transition"
      top
    )
      span Dock to Bottom
      v-icon(
        :color="layoutHelper === 'horizontal' ? 'primary' : ''"
        @click="INTEGRATION_SET_HELPER_LAYOUT('horizontal')"
        slot="activator"
      ) mdi-page-layout-footer
    v-tooltip(
      :open-delay="0"
      :close-delay="0"
      color="black"
      transition="fade-transition"
      top
    )
      span Dock to Right
      v-icon(
        :color="layoutHelper === 'vertical' ? 'primary' : ''"
        @click="INTEGRATION_SET_HELPER_LAYOUT('vertical')"
        slot="activator"
      ) mdi-page-layout-sidebar-right
    v-icon(@click="INTEGRATION_SET_HELPER(false)") mdi-close
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
import { InputTypes } from '@/components'
import { parseConfig } from '@/lib/utils'
import { BuildWorker } from '@/service'

const BUFFER_MAX = 100

export default {
  name: 'HelperIntegration',
  components: { InputTypes },
  data: () => ({
    model: {},
    tab: 1,
    worker: null,
    consoleBuffer: [],
    freeze: false
  }),
  computed: {
    ...mapState('Integration', ['loaded', 'layoutHelper']),
    parsedConfig () {
      const config = get(this, 'loaded.config', '')
      return parseConfig(config)
    },
    source () {
      return get(this, 'loaded.source', '')
    }
  },
  watch: {
    parsedConfig: {
      immediate: true,
      deep: true,
      handler () {
        // Create local config model
        this.model = this.parsedConfig.variables.reduce((acc, cur) => {
          acc[cur.name] = cur.default || null
          return acc
        }, {})
      }
    },
    model: {
      handler: debounce(function () {
        this.restartWorker()
      }, process.env.VUE_APP_COMMIT_DEBOUNCE),
      deep: true
    },
    source: {
      immediate: true,
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
    ...mapMutations('Integration', ['INTEGRATION_SET_HELPER_LAYOUT', 'INTEGRATION_SET_HELPER']),
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

        const loaded = get(this, 'loaded', null)
        const config = this.model

        // Create worker and hook onmessage/onerror callback
        this.worker = await BuildWorker(loaded, config)
        this.worker.onmessage = this.onmessage
        this.worker.onerror = this.onerror
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
      this.consoleBufferAdd(`Error: ${message}:${lines}`, true)
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
