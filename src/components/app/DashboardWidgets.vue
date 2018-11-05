<template lang="pug">
#dashboard-widgets

  v-container.pa-3(grid-list-xs)
    v-layout(row wrap)
      v-flex(
        xs4
        v-for="(item, index) in list"
        :key="index"
        @click="addWidget(item.id)"
        justify-center
      )
        v-card.text-xs-center
          v-card-text
            v-layout(column justify-center fill-height)
              .caption {{ item.label }}
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'DashboardWidgets',
  computed: mapGetters('Widget', ['list']),
  methods: {
    ...mapActions('Dashboard', ['updateLoaded']),
    addWidget (id) {
      const config = {} // Parse config definition here, this.widgetById(id)
      const newWidget = {
        x: 0,
        y: 0,
        w: 4,
        h: 4,
        i: id, // Make unique ID here (need to check if DB already has ID)
        config
      }
      this.updateLoaded({ widgets: [newWidget] })
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-widgets
  .v-card__text
    height 80px
    padding 6px

    div
      overflow hidden
      word-wrap break-word
</style>
