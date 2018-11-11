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
    :class="{ 'hidden' : focusedIntegration || focusedWidget }"
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
      dashboard-integrations
    v-tab-item
      dashboard-widgets
    v-tab-item
      dashboard-settings

  v-scroll-x-transition
    dashboard-integration-config
  v-scroll-x-transition
    dashboard-widget-config
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'
import { AppContextToolbar, DashboardIntegrations, DashboardWidgets, DashboardSettings, DashboardIntegrationConfig, DashboardWidgetConfig } from '@/components/app'

export default {
  name: 'DashboardCtx',
  components: {
    AppContextToolbar,
    DashboardIntegrations,
    DashboardWidgets,
    DashboardSettings,
    DashboardIntegrationConfig,
    DashboardWidgetConfig
  },
  computed: {
    ...mapGetters('Widget', ['list']),
    ...mapGetters('Dashboard', ['loaded', 'focusedIntegration', 'focusedWidget']),
    label: {
      get () {
        return _.get(this, 'loaded.label', '')
      },
      set (label) {
        this.updateLoaded({ label })
      }
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
#dashboard-ctx
  .v-tabs
    &.hidden
      display none
</style>
