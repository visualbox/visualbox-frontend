<template lang="pug">
grid-layout#dashboard-layout(
  :layout="layout"
  :col-num="24"
  :row-height="15"
  :margin="[10, 10]"
  :is-draggable="true"
  :is-resizable="true"
  :use-css-transforms="true"
  :auto-size="false"
  @layout-updated="layoutUpdatedEvent"
)
  grid-item(
    v-for="item in layout"
    :key="item.i"
    :x="item.x"
    :y="item.y"
    :w="item.w"
    :h="item.h"
    :i="item.i"
  )
    base-card {{ item.i }}
</template>

<script>
import * as _ from 'lodash'
import { mapGetters, mapActions } from 'vuex'
import { GridLayout, GridItem } from 'vue-grid-layout'
import cloneDeep from '@/lib/cloneDeep'
import { BaseCard } from '@/components/base'

export default {
  name: 'DashboardLayout',
  components: {
    GridLayout,
    GridItem,
    BaseCard
  },
  data: () => ({
    layout: []
  }),
  computed: {
    ...mapGetters('Dashboard', ['loaded']),
    widgets () {
      return _.get(this, 'loaded.widgets', [])
    }
  },
  methods: {
    ...mapActions('Dashboard', ['updateLoaded']),
    layoutUpdatedEvent (widgets) {
      console.log('new layout', widgets)
      this.updateLoaded({ widgets })
    }
  },
  watch: {
    widgets: {
      handler: function (widgets) {
        console.log('hasChanged')
        this.layout = cloneDeep(widgets)
      },
      deep: true
    }
  },
  created () {
    console.log(cloneDeep(this.widgets))
    this.layout = cloneDeep(this.widgets)
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-layout
  height 100%
  background #FFF

  .vue-grid-item
    background-color #FFF

    .v-card
      height 100%
</style>
