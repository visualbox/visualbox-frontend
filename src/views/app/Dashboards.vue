<template lang="pug">
#dashboards
  new-dashboard(v-model="showDialog")

  app-context-toolbar
    .subheading Dashboards
    v-spacer
    v-btn(
      icon
      @click="showDialog = true"
    )
      v-icon mdi-plus-box

  v-list
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
    )
      v-list-tile-title {{ index }}
</template>

<script>
import { mapGetters } from 'vuex'
import AppContextToolbar from '@/components/app/AppContextToolbar'
import NewDashboard from '@/components/dialog/NewDashboard'

export default {
  name: 'Dashboards',
  components: {
    AppContextToolbar,
    NewDashboard
  },
  data: () => ({
    showDialog: false
  }),
  computed: mapGetters('Dashboard', ['list'])
}
</script>

<style lang="stylus" scoped>
#dashboards
  .v-list
    padding 0
</style>
