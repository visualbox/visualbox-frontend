<template lang="pug">
grid-layout#dashboard-layout(
  :layout.sync="layout"
  :row-height="30"
  :margin="[10, 10]"
  :is-draggable="true"
  :is-resizable="true"
  :vertical-compact="false"
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
  ) {{ item.i }}
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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
  computed: mapGetters('Dashboard', ['loaded']),
  methods: {
    ...mapActions('Dashboard', ['updateLoaded']),
    layoutUpdatedEvent (layout) {
      console.log('new layout')
      this.updateLoaded({ widgets: layout })
    }
  },
  watch: {
    loaded: {
      handler: function (loaded) {
        console.log('loaded', loaded.widgets)
        this.layout = cloneDeep(loaded.widgets)
      },
      deep: true
    }
  },
  mounted () {
    if (this.loaded !== null) {
      const foo = cloneDeep(this.loaded.widgets)
      console.log(foo)
      this.layout = foo
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-layout
  height 100%
  background #FFF

  .vue-grid-item
    background-color #FFF
</style>
