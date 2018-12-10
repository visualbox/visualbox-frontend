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
  computed: {
    ...mapGetters('Widget', ['list']),
    ...mapGetters('Dashboard', ['loaded'])
  },
  methods: mapActions('Dashboard', ['addWidget'])
}
</script>

<style lang="stylus" scoped>
#dashboard-widgets
  .v-card
    border-radius 4px

    &:hover
      z-index 2
      cursor pointer
      box-shadow 0 0 5px rgba(0, 0, 0, 1)
      -webkit-transition all 50ms ease-in
      -webkit-transform scale(1.05)
      -ms-transition all 50ms ease-in
      -ms-transform scale(1.05)
      -moz-transition all 50ms ease-in
      -moz-transform scale(1.05)
      transition all 50ms ease-in
      transform scale(1.05)

    .v-card__text
      height 80px
      padding 6px

      div
        overflow hidden
        word-wrap break-word
</style>
