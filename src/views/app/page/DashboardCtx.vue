<template lang="pug">
#dashboard-ctx(v-if="loaded !== null && typeof loaded !== 'undefined'")
  app-context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ label }}

  v-tabs(
    color="rgba(0,0,0,0)"
    slider-color="primary"
    grow
  )
    v-tab
      v-icon device_hub
    v-tab
      v-icon widgets
    v-tab
      v-icon settings

    v-tab-item
      span Integrations
    v-tab-item
      dashboard-widgets
    v-tab-item
      dashboard-settings
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'
import { AppContextToolbar, DashboardWidgets, DashboardSettings } from '@/components/app'

export default {
  name: 'DashboardCtx',
  components: {
    AppContextToolbar,
    DashboardWidgets,
    DashboardSettings
  },
  computed: {
    ...mapGetters('Widget', ['list']),
    ...mapGetters('Dashboard', ['loaded']),
    label: {
      get () {
        return this.loaded.label
      },
      set: _.debounce(function (label) {
        this.updateLoaded({ label })
      }, process.env.VUE_APP_COMMIT_DEBOUNCE)
    },
    updatedAt () {
      const { updatedAt } = this.loaded
      return moment(updatedAt).format('DD/MM HH:mm:ss')
    }
  },
  methods: mapActions('Dashboard', ['updateLoaded'])
}
</script>

<style lang="stylus" scoped>
</style>
