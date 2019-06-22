<template lang="pug">
#helper-widget
  v-system-bar
    //- Tabs
    .tab(active) Preview

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

  //- Preview pane
  .pane.pa-0(active)
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
import { mapState, mapMutations, mapGetters } from 'vuex'
import { Tooltip } from '@/components'
import { BuildIFrame } from '@/service'

export default {
  name: 'HelperWidget',
  components: { Tooltip },
  computed: {
    ...mapGetters('Widget', [
      'configMapById',
      'sourceMapById'
    ]),
    ...mapState('Project', [
      'configMapModel',
      'layoutHelper',
      'dirty',
      'files',
      'id'
    ]),
    source () {
      return this.sourceMapById(this.id)
    }
  },
  watch: {
    /**
     * Watch when settings have changed by the user.
     */
    configMapModel: {
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
          this.$refs.preview.src = BuildIFrame(source, this.configMapModel)
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
    overflow hidden

    &[active]
      display block

    iframe
      width 100%
      height 100%
      border 0
      background #FFF
      overflow auto
</style>
