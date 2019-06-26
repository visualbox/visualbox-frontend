<template lang="pug">
grid-layout#public-dashboard-layout(
  :layout="layout"
  :col-num="24"
  :row-height="15"
  :margin="[16, 16]"
  :is-draggable="false"
  :is-resizable="false"
  :use-css-transforms="true"
  class="no-transition"
)
  grid-item(
    v-for="item in layout"
    :key="item.i"
    :x="item.x"
    :y="item.y"
    :w="item.w"
    :h="item.h"
    :i="item.i"
    :style="getWidgetStyle(item)"
    :class="getWidgetClass(item)"
  )
    iframe(
      :ref="item.i"
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
import { mapState } from 'vuex'
import { GridLayout, GridItem } from 'vue-grid-layout'
import { cloneDeep } from '@/lib/utils'
import { IFrameHandler } from '@/service'

export default {
  name: 'PublicDashboardLayout',
  components: {
    GridLayout,
    GridItem
  },
  data: () => ({
    layout: [],
    widgetsWithData: []
  }),
  computed: {
    ...mapState('Public', ['loaded']),
    widgets () {
      return get(this, 'loaded.widgets', [])
    }
  },
  methods: {
    getWidgetStyle ({ settings }) {
      try {
        // rgba
        const { r, g, b, a } = settings.rgba
        // radius
        const radius = typeof this.loaded.settings.radius === 'undefined'
          ? 5
          : this.loaded.settings.radius
        // shadow
        const shadow = typeof this.loaded.settings.shadow === 'undefined'
          ? 3
          : this.loaded.settings.shadow
        // shadowRadius
        const shadowRadius = typeof this.loaded.settings.shadowRadius === 'undefined'
          ? 5
          : this.loaded.settings.shadowRadius

        const cssBgc = `rgba(${r}, ${g}, ${b}, ${a})`
        const cssRadius = `${radius}px`
        const cssShadow = `0 0 ${shadowRadius}px rgba(0, 0, 0, ${shadow / 100}`
        return {
          'background-color': cssBgc,
          'border-radius': cssRadius,
          'box-shadow': cssShadow
        }
      } catch (e) {
        return {}
      }
    },
    getWidgetClass ({ i, settings }) {
      return {
        'hide': !!settings.hide && !this.widgetsWithData.includes(i),
        'no-transition': true
      }
    }
  },
  created () {
    this.layout = cloneDeep(this.widgets)
  },
  mounted () {
    IFrameHandler.makePublicDashboard()
    IFrameHandler.attachRefs(this.$refs)
    IFrameHandler.attachOnWidgetDataCb(i => this.widgetsWithData.push(i))
    IFrameHandler.generate(this.widgets)
  }
}
</script>

<style lang="stylus" scoped>
#public-dashboard-layout
  width 100%
  height 100%
  min-height 100%
  background #FFF

  .vue-grid-item
    overflow hidden
    -webkit-transition: filter 0.25s, opacity 0.25s !important
    transition filter 0.25s, opacity 0.25s !important

    &.hide
      filter blur(10px)
      opacity .25

    &.vue-resizable
      -webkit-box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;

      iframe
        pointer-events none

    iframe
      width 100%
      height 100%
      border 0

  >>> .vue-grid-placeholder
    background #000
</style>
