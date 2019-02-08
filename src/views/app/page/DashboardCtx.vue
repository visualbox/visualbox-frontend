<template lang="pug">
#dashboard-ctx(v-if="loaded")
  context-toolbar
    v-btn(
      icon
      @click="goBack"
    )
      v-icon mdi-menu-left
    .subheading {{ label }}
    v-spacer
    v-btn(
      @click="DASHBOARD_SET_FULLSCREEN(!isFullscreen)"
      icon
    )
      v-icon {{ fullscreenIcon }}
    v-btn(
      @click="DASHBOARD_SET_EDITING(!isEditing)"
      icon
    )
      v-icon {{ editingIcon }}

  v-tabs(
    :class="{ 'hidden': focusedIntegration || focusedWidget || isAddingIntegration }"
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

  //------------------------------------

  //- Adding integration menu
  v-scroll-x-transition(hide-on-leave)
    dashboard-add-integration(v-if="isAddingIntegration")

  //- Integration config menu
  v-scroll-x-transition(hide-on-leave)
    dashboard-integration-config(v-if="focusedIntegration")

  //- Widet config menu
  v-scroll-x-transition(hide-on-leave)
    dashboard-widget-config(v-if="focusedWidget")
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar } from '@/components'
import {
  DashboardIntegrations,
  DashboardWidgets,
  DashboardSettings,
  DashboardAddIntegration,
  DashboardIntegrationConfig,
  DashboardWidgetConfig
} from '@/components/dashboard'

export default {
  name: 'DashboardCtx',
  components: {
    ContextToolbar,
    DashboardIntegrations,
    DashboardWidgets,
    DashboardSettings,
    DashboardAddIntegration,
    DashboardIntegrationConfig,
    DashboardWidgetConfig
  },
  computed: {
    ...mapState('Widget', ['list']),
    ...mapState('Dashboard', [
      'loaded',
      'isAddingIntegration',
      'isEditing',
      'isFullscreen'
    ]),
    ...mapGetters('Dashboard', ['focusedIntegration', 'focusedWidget']),
    label: {
      get () {
        return get(this, 'loaded.label', '')
      },
      set (label) {
        this.updateLoaded({ label })
      }
    },
    editingIcon () {
      return this.isEditing ? 'mdi-lock' : 'mdi-cursor-move'
    },
    fullscreenIcon () {
      return this.isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
    }
  },
  methods: {
    ...mapMutations('Dashboard', [
      'DASHBOARD_SET_FOCUSED_WIDGET',
      'DASHBOARD_SET_FOCUSED_INTEGRATION',
      'DASHBOARD_SET_ADDING_INTEGRATION',
      'DASHBOARD_SET_EDITING',
      'DASHBOARD_SET_FULLSCREEN'
    ]),
    ...mapActions('Dashboard', ['updateLoaded']),
    goBack () {
      if (this.focusedWidget)
        this.DASHBOARD_SET_FOCUSED_WIDGET(null)
      else if (this.focusedIntegration)
        this.DASHBOARD_SET_FOCUSED_INTEGRATION(null)
      else if (this.isAddingIntegration)
        this.DASHBOARD_SET_ADDING_INTEGRATION(false)
      else {
        this.DASHBOARD_SET_EDITING(false)
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-ctx
  .v-tabs
    &.hidden
      display none
</style>
