<template lang="pug">
#helper-widget
  v-system-bar
    .tab(
      :active="tab === 0"
      @click="tab = 0"
    ) Configure
    .tab(
      :active="tab === 1"
      @click="tab = 1"
    ) Preview
    v-spacer
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
  .pane.pa-0(:active="tab === 1")
    iframe(
      ref="preview"
      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
      allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor"
      scrolling="auto"
      allowTransparency="true"
      allowpaymentrequest="true"
      allowfullscreen="true"
    )
</template>

<script>
import debounce from 'lodash-es/debounce'
import { mapState, mapMutations, mapActions } from 'vuex'
import { InputTypes, Tooltip } from '@/components'
import { parseConfig } from '@/lib/utils'
import { fileContents } from '@/lib/utils/projectUtils'
import { BuildIFrame } from '@/service'

export default {
  name: 'HelperWidget',
  components: {
    InputTypes,
    Tooltip
  },
  data: () => ({
    model: {},
    tab: 1,
  }),
  computed: {
    ...mapState('Project', ['layoutHelper', 'dirty', 'files']),
    ...mapState('Bundler', ['active', 'status']),
    parsedConfig () {
      const contents = fileContents(this.files, ['config.json'])
      if (!contents)
        return { error: ['Unable to parse widget configuration'] }
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

    /**
     * Watch when settings have changed by the user.
     */
    model: {
      deep: true,
      handler (config) {
        try {
          this.$refs.preview.contentWindow.postMessage({
            call: 'sendConfig',
            value: config
          }, '*')
        } catch (e) {
          console.log(e)
        }
      }
    }
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_SET_HELPER_LAYOUT',
      'PROJECT_SET_HELPER'
    ]),
    ...mapActions('Project', ['save']),
    ...mapActions('Bundler', ['queueBundle']),

    async fetchBundle () {
      try {
        // Should use bundler
        const contents = fileContents(this.files, ['index.html'])
        if (!contents)
          return

        this.$refs.preview.src = BuildIFrame(contents, this.model)
      } catch (e) {
        console.log('Mount bundle error', e)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#helper-widget
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
    overflow hidden

    &[active]
      visibility visible

    iframe
      width 100%
      height 100%
      border 0
      background #FFF
</style>
