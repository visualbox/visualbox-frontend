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
    v-list-tile
      v-list-tile-title Test
</template>

<script>
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
  })
}
</script>

<style lang="stylus" scoped>
#dashboards
  .v-list
    padding 0
</style>
