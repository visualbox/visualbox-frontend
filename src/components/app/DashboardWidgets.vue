<template lang="pug">
#dashboard-widgets
  v-list
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      draggable="true"
      @dragstart="e => dragstartHandler(e, item)"
      @click=""
    )
      v-list-tile-avatar
        v-icon widgets
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'DashboardWidgets',
  computed: mapGetters('Widget', ['list']),
  methods: {
    dragstartHandler (e, item) {
      e.dataTransfer.dropEffect = 'copy'
      e.dataTransfer.effectAllowed = 'all'
      e.dataTransfer.setData('text/plain', JSON.stringify(item))
      console.log(item)
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-widgets
  .v-card
    height 90px
    overflow hidden
    word-break break-all
</style>
