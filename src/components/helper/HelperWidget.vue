<template lang="pug">
#helper-widget
  v-system-bar
    //- Tabs
    .tab(:active="tab === 0" @click="tab = 0") Configure
    .tab(:active="tab === 1" @click="tab = 1") Preview

    v-spacer

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

  //- Preview pane
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
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { InputTypes, Tooltip } from '@/components'
import { parseConfig } from '@/lib/utils'
import { BuildIFrame } from '@/service'

export default {
  name: 'HelperWidget',
  components: {
    InputTypes,
    Tooltip
  },
  data: () => ({
    tab: 1,
    model: {}
  }),
  computed: {
    ...mapGetters('Widget', [
      'configMapById',
      'sourceMapById'
    ]),
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
    source () {
      return this.sourceMapById(this.id)
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
    },

    source: {
      immediate: true,
      handler: debounce(function (source) {
        this.$nextTick(() => {
          this.$refs.preview.src = BuildIFrame(source, this.model)
        })
      }, 500)
    }
  },
  methods: mapMutations('Project', [
    'PROJECT_SET_HELPER_LAYOUT',
    'PROJECT_SHOW_HELPER'
  ])
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

  .pane
    display none
    padding 16px
    position absolute
    top 31px; right 0; left 0; bottom 0;
    overflow auto

    &[active]
      display block

    iframe
      width 100%
      height 100%
      border 0
      background #FFF
</style>
