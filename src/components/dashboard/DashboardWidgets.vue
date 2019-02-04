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
              v-icon(
                v-if="icon(item)"
                :color="color(item)"
              ) {{ icon(item) }}
              .caption {{ name(item) }}
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapActions } from 'vuex'
import { packageJson } from '@/lib/utils/projectUtils'

export default {
  name: 'DashboardWidgets',
  computed: {
    ...mapState('Widget', ['list']),
    ...mapState('Dashboard', ['loaded'])
  },
  methods: {
    ...mapActions('Dashboard', ['addWidget']),
    color (item) {
      return packageJson(item, 'color', '#FFF')
    },
    icon (item) {
      return packageJson(item, 'icon', false)
    },
    name (item) {
      return packageJson(item, 'name', 'Untitled')
    }
  }
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
