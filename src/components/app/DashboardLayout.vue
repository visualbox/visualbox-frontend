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
  ) {{ item.i }}
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { GridLayout, GridItem } from 'vue-grid-layout'
import cloneDeep from '@/lib/cloneDeep'

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
    widgets () {
      return _.get(this, 'loaded.widgets', [])
    }
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED']),
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
        this.DASHBOARD_SET_FOCUSED(i)
    },
    blurWidget () {
      if (!this.isEditing)
        this.DASHBOARD_SET_FOCUSED(null)
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

  >>> .vue-grid-placeholder
    background #000
</style>
