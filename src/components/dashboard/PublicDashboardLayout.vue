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
    class="no-transition"
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
    v-overlay(
      :value="showOverlay(item)"
      :opacity="0.95"
      absolute
    )
      img(
        :src="require('../../assets/img/vbox-white.svg')"
        width="50"
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
    showOverlay ({ i, settings }) {
      return !!settings.hide && !this.widgetsWithData.includes(i)
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
@keyframes pulse
  0%
    opacity 0
    transform scale(1)
  20%
    opacity .5
  80%
    opacity 0
    transform scale(1.5)
  100%
    opacity 0
    transform scale(2)

#public-dashboard-layout
  width 100%
  height 100%
  min-height 100%
  background #FFF

  .vue-grid-item
    overflow hidden

    &.vue-resizable
      -webkit-box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;

      iframe
        pointer-events none

    iframe
      width 100%
      height 100%
      border 0

    >>> .v-overlay__content
      opacity .75

      &:after
        content url('../../assets/img/vbox-white.svg')
        top 0
        width 50px
        height 50px
        position absolute
        display block
        animation pulse 4s ease 0s infinite

  >>> .vue-grid-placeholder
    background #000
</style>
