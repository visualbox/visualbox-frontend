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
    :class="{ 'hidden' : focusedIntegration || focusedWidget || isAddingIntegration }"
    color="rgba(0,0,0,0)"
    slider-color="primary"
    grow
  )
    v-tab
      v-icon mdi-source-fork
    v-tab
      v-icon mdi-hexagon-multiple
    v-tab
      v-icon mdi-settings

    //- Integrations tab content
    v-tab-item
      dashboard-integrations

    //- Widgets tab content
    v-tab-item
      dashboard-widgets

    //- Settings tab content
    v-tab-item
      dashboard-settings

  //- Adding integration menu
  v-scroll-x-transition
    dashboard-add-integration

  //- Integration config menu
  v-scroll-x-transition
    dashboard-integration-config

  //- Widet config menu
  v-scroll-x-transition
    dashboard-widget-config
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { mapState, mapActions, mapGetters } from 'vuex'
import {
  AppContextToolbar,
  DashboardIntegrations,
  DashboardWidgets,
  DashboardSettings,
  DashboardAddIntegration,
  DashboardIntegrationConfig,
  DashboardWidgetConfig
} from '@/components/app'

export default {
  name: 'DashboardCtx',
  components: {
    AppContextToolbar,
    DashboardIntegrations,
    DashboardWidgets,
    DashboardSettings,
    DashboardAddIntegration,
    DashboardIntegrationConfig,
    DashboardWidgetConfig
  },
  computed: {
    ...mapState('Widget', ['list']),
    ...mapState('Dashboard', ['loaded', 'isAddingIntegration']),
    ...mapGetters('Dashboard', ['focusedIntegration', 'focusedWidget']),
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
  height 100%
  overflow auto

  .v-tabs
    &.hidden
      display none
</style>
