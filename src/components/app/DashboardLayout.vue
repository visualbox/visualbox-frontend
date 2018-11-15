<template lang="pug">
grid-layout#dashboard-layout(
  :layout="layout"
  :col-num="24"
  :row-height="15"
  :margin="[16, 16]"
  :is-draggable="isEditing"
  :is-resizable="isEditing"
  :use-css-transforms="true"
  :auto-size="false"
  @layout-updated="layoutUpdatedEvent"
  @click.native.capture="blurWidget"
)
  grid-item(
    v-for="item in layout"
    :key="item.i"
    :x="item.x"
    :y="item.y"
    :w="item.w"
    :h="item.h"
    :i="item.i"
    :style="getWidgetStyle(item.settings)"
    @click.native="focusWidget(item.i)"
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
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { GridLayout, GridItem } from 'vue-grid-layout'
import cloneDeep from '@/lib/cloneDeep'
import IFrameHandler from '@/lib/iframeHandler'

export default {
  name: 'DashboardLayout',
  components: {
    GridLayout,
    GridItem
  },
  data: () => ({
    layout: []
  }),
  computed: {
    ...mapState('Dashboard', ['isEditing']),
    ...mapGetters('Dashboard', ['loaded']),
    ...mapGetters('Widget', ['widgetById']),
    widgets () {
      return _.get(this, 'loaded.widgets', [])
    }
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_WIDGET']),
    ...mapActions('Dashboard', ['updateLoaded']),
    layoutUpdatedEvent (widgets) {
      this.updateLoaded({ widgets })
    },
    getWidgetStyle (settings) {
      const { r, g, b, a } = settings.rgba
      const bgc = `rgba(${r}, ${g}, ${b}, ${a})`
      return { 'background-color': bgc }
    },
    focusWidget (i) {
      if (!this.isEditing)
        this.DASHBOARD_SET_FOCUSED_WIDGET(i)
    },
    blurWidget () {
      if (!this.isEditing)
        this.DASHBOARD_SET_FOCUSED_WIDGET(null)
    }
  },
  watch: {
    widgets: {
      handler: function (widgets) {
        this.layout = cloneDeep(widgets)
      },
      deep: true
    }
  },
  created () {
    this.layout = cloneDeep(this.widgets)
  },
  mounted () {
    IFrameHandler.init(this.widgetById, this.$refs)
    IFrameHandler.generate(this.widgets)
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-layout
  height 100%
  background #FFF

  .vue-grid-item
    &.vue-resizable:hover
      -webkit-box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;

    iframe
      width 100%
      height 100%
      border 0
      position absolute
      top 0
      left 0

  >>> .vue-grid-placeholder
    background #000
</style>
