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
    v-spacer
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
    ) {{ item.timestamp }} {{ item.line }}
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapMutations } from 'vuex'
import { InputTypes } from '@/components'
import parseConfig from '@/lib/parseConfig'

const BUFFER_MAX = 100

export default {
  name: 'HelperIntegration',
  components: { InputTypes },
  data: () => ({
    model: {},
    tab: 0,
    worker: null,
    consoleBuffer: [],
    freeze: false
  }),
  computed: {
    ...mapState('Integration', ['loaded', 'layoutHelper']),
    parsedConfig () {
      const config = _.get(this, 'loaded.config', '')
      return parseConfig(config)
    },
    source () {
      return _.get(this, 'loaded.source', '')
    }
  },
  watch: {
    parsedConfig: {
      immediate: true,
      deep: true,
      handler: function () {
        // Create local config model
        this.model = this.parsedConfig.variables.reduce((acc, cur) => {
          acc[cur.name] = cur.default || null
          return acc
        }, {})
      }
    },
    model: {
      handler: _.debounce(function () {
        this.restartWorker()
      }, process.env.VUE_APP_COMMIT_DEBOUNCE),
      deep: true
    },
    source: {
      immediate: true,
      handler: _.debounce(function () {
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
    restartWorker () {
      if (this.freeze)
        return

      this.consoleBuffer = []
      this.consoleBufferAdd('Restarting...')
      try {
        if (this.worker !== null) {
          this.worker.terminate()
          this.worker = null
        }

        const source = _.get(this, 'loaded.source', '')

        // Create injectable JS code containing config vars
        const injected = `const CONFIG = ${JSON.stringify(this.model)};`

        // Create worker BLOB with injected config vars
        const workerBlob = URL.createObjectURL(new Blob([injected + source], { type: 'application/javascript' }))

        // Create worker and hook onmessage callback
        this.worker = new Worker(workerBlob)
        this.worker.onmessage = this.onmessage
        this.worker.onerror = this.onerror
      } catch (e) {
        this.onerror(new Error('Failed to start Web Worker', e))
      }
    },
    consoleBufferAdd (i) {
      if (this.consoleBuffer.length > BUFFER_MAX)
        this.consoleBuffer.pop()
      this.consoleBuffer.unshift({
        timestamp: +new Date(),
        line: i
      })
    },
    onmessage ({ data }) {
      this.consoleBufferAdd(data)
    },
    onerror (e) {
      this.consoleBufferAdd('error' + e.message)
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
  background $vb-drawer-ctx

  .v-system-bar
    margin 0
    padding 0
    background $vb-application
    border-bottom 1px solid $vb-gutter

    .tab
      padding 2px 6px
      border-right 1px solid $vb-gutter
      display inline-block
      cursor pointer

      &[active]
        color white
        background $vb-gutter

    .v-icon
      margin-right 6px

  .pane
    visibility hidden
    padding 16px
    position absolute
    top 24px; right 0; left 0; bottom 0;
    overflow auto

    &[active]
      visibility visible
</style>
