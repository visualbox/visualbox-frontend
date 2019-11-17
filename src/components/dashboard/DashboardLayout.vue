<template lang="pug">
grid-layout#dashboard-layout(
  :layout="layout"
  :col-num="24"
  :row-height="15"
  :margin="[16, 16]"
  :is-draggable="isEditing"
  :is-resizable="isEditing"
  :use-css-transforms="true"
  :class="{ 'no-transition': !isEditing }"
  @layout-updated="layoutUpdatedEvent"
  @click.native.capture="DASHBOARD_SET_FOCUSED_WIDGET(null)"
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
    v-speed-dial(
      direction="bottom"
      absolute
      top right
      open-on-hover
    )
      v-btn(
        slot="activator"
        @click.native.stop="DASHBOARD_SET_FOCUSED_WIDGET(item.i)"
        color="grey darken-3"
        dark fab small
      )
        v-icon mdi-pencil
      v-btn(
        @click.native.stop="copyWidget(item.i)"
        color="primary"
        fab dark small
      )
        v-icon mdi-content-copy
      v-btn(
        @click.native.stop="removeWidget(item)"
        color="red"
        fab dark small
      )
        v-icon mdi-delete
    iframe(
      :ref="item.i"
      sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts"
      allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor"
      scrolling="auto"
      allowTransparency="true"
      allowpaymentrequest="true"
      allowfullscreen="true"
    )
  #blur-overlay(v-if="!!focusedWidget && false")
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { GridLayout, GridItem } from 'vue-grid-layout'
import { cloneDeep, difference } from '@/lib/utils'
import { IFrameHandler } from '@/service'

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
    ...mapState('Dashboard', ['loaded', 'isEditing']),
    ...mapGetters('Dashboard', ['focusedWidget']),
    widgets () {
      return get(this, 'loaded.widgets', [])
    }
  },
  methods: {
    ...mapMutations('Dashboard', [
      'DASHBOARD_CONCAT_LOADED',
      'DASHBOARD_SET_FOCUSED_WIDGET'
    ]),
    ...mapActions('Dashboard', [
      'copyWidget',
      'removeWidget'
    ]),
    layoutUpdatedEvent (widgets) {
      this.DASHBOARD_CONCAT_LOADED({ widgets })
    },
    getWidgetStyle ({ settings }) {
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
    },
    getWidgetClass ({ i, settings }) {
      return {
        'focused': this.isFocused(i),
        'no-transition': !this.isEditing
      }
    },
    isFocused (wI) {
      return wI === get(this, 'focusedWidget.i', null)
    }
  },
  watch: {
    widgets: {
      deep: true,
      handler (widgets) {
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
      }
    }
  },
  created () {
    this.layout = cloneDeep(this.widgets)
  },
  mounted () {
    IFrameHandler.attachRefs(this.$refs)
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
    overflow hidden

    &.focused
      // z-index 3
      outline 2px dashed #FFF
      box-shadow 0 0 0 2px #000

    &.vue-resizable
      -webkit-box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;
      box-shadow: 0 3px 5px -1px rgba(0,0,0,.2),0 5px 8px 0 rgba(0,0,0,.14),0 1px 14px 0 rgba(0,0,0,.12)!important;

      iframe
        pointer-events none

    &:hover:not(.vue-resizable) .v-speed-dial
      display block

    >>> .v-speed-dial
      top 5px
      right 5px
      display none

      .v-speed-dial__list
        top 75% !important

        .v-btn
          margin-top 1px

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
