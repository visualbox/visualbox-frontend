<template lang="pug">
grid-layout#dashboard-layout(
  :layout="layout"
  :col-num="24"
  :row-height="15"
  :margin="[16, 16]"
  :is-draggable="isEditing"
  :is-resizable="isEditing"
  :use-css-transforms="true"
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
    :class="{ 'focused' : isFocused(item.i) }"
  )
    v-speed-dial(
      direction="bottom"
      absolute
      top right
      open-on-hover
    )
      v-btn(
        slot="activator"
        @click.native.stop="focusWidget(item.i)"
        color="grey darken-3"
        dark fab small
      )
        v-icon mdi-pencil
      v-btn(
        @click.native.stop="removeWidget(item.i)"
        color="red"
        fab dark small
      )
        v-icon mdi-delete
    iframe(
      :ref="item.i"
      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
      allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor"
      scrolling="auto"
      allowTransparency="true"
      allowpaymentrequest="true"
      allowfullscreen="true"
    )
  #blur-overlay(v-if="!!focusedWidget && false")
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { GridLayout, GridItem } from 'vue-grid-layout'
import cloneDeep from '@/lib/cloneDeep'
import difference from '@/lib/difference'
import IFrameHandler from '@/lib/iframeHandler'

export default {
  name: 'DashboardLayout',
  components: {
    GridLayout,
    GridItem
  },
  data: () => ({
    layout: [],
    foo: null
  }),
  computed: {
    ...mapState('Dashboard', ['loaded', 'isEditing']),
    ...mapState('Data', ['data']),
    ...mapGetters('Dashboard', ['focusedWidget']),
    ...mapGetters('Widget', ['widgetById']),
    widgets () {
      return _.get(this, 'loaded.widgets', [])
    }
  },
  methods: {
    ...mapMutations('Dashboard', [
      'DASHBOARD_SET_FOCUSED_WIDGET',
      'DASHBOARD_REMOVE_WIDGET'
    ]),
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
    },
    removeWidget (i) {
      if (!this.isEditing)
        this.DASHBOARD_REMOVE_WIDGET(i)
    },
    isFocused (wI) {
      return wI === _.get(this, 'focusedWidget.i', null)
    }
  },
  watch: {
    widgets: {
      handler: function (widgets) {
        const layout = this.layout

        // Copy new widgets to layout system and let them render
        this.layout = cloneDeep(widgets)

        // Removed a widget, early abort
        if (widgets.length < layout.length)
          return

        // Find new widgets (newly added) by
        // taking diff of layout and widgets.
        // A widget is 'new' if it has property 'i' changed.
        const diff = difference(widgets, layout)
        const newWidgets = diff.filter(w => w.hasOwnProperty('i'))

        // Next tick to allow template to render.
        // this.$refs is used in IFrameHandler.
        if (newWidgets.length > 0) {
          this.$nextTick(() => {
            IFrameHandler.generate(newWidgets)
          })
        }
      },
      deep: true
    },
    data: {
      handler: function (newVal) {
        IFrameHandler.onDataChange(this.widgets, newVal)
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
  width 100%
  height 100%
  min-height 100%
  background #FFF

  .vue-grid-item
    &.focused
      // z-index 3
      outline 2px solid #FFF

    &.vue-resizable
      -webkit-box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;

      iframe
        pointer-events none

    &:hover:not(.vue-resizable) .v-speed-dial
      display block

    .v-speed-dial
      top 25px
      right 5px
      display none

    iframe
      width 100%
      height 100%
      border 0

  >>> .vue-grid-placeholder
    background #000

  #blur-overlay
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    z-index 2
    backdrop-filter blur(5px)
</style>
