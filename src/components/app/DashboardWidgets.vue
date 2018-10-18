<template lang="pug">
#dashboard-widgets
  v-container.pa-3
    v-layout(row wrap)
      v-flex(
        xs4
        v-for="(item, index) in list"
        :key="index"
        draggable="true"
      )
        v-card(flat tile)
          span {{ item.label }}
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'DashboardWidgets',
  computed: mapGetters('Widget', ['list'])
}
</script>

<style lang="stylus" scoped>
#dashboard-widgets
  .v-card
    height 90px
</style>
