<template lang="pug">
#dashboard-widgets
  v-container.pa-3(grid-list-xs)
    v-layout(row wrap)
      v-flex(
        xs4
        v-for="(item, index) in list"
        :key="index"
        draggable="true"
        justify-center
      )
        v-card.text-xs-center
          v-card-text
            v-layout(column justify-center fill-height)
              .caption {{ item.label }}
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DashboardWidgets',
  computed: mapGetters('Widget', ['list'])
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
