<template lang="pug">
#dashboard-ctx(v-if="loaded")
  context-toolbar
    tooltip(text="Back" :open-delay="800" bottom)
      v-btn(@click="goBack" fab text)
        v-icon mdi-menu-left
    .subheading {{ loaded.label }}
    template(v-if="!isExploring")
      v-spacer
      tooltip(text="Fullscreen" :open-delay="800" bottom)
        v-btn.mr-1(@click="DASHBOARD_SET_FULLSCREEN(!isFullscreen)" fab text)
          v-icon {{ fullscreenIcon }}
      tooltip(text="Move / Resize" :open-delay="800" bottom)
        v-btn(@click="DASHBOARD_SET_EDITING(!isEditing)" fab text)
          v-icon {{ editingIcon }}

  template(v-if="!focusedIntegration && !focusedWidget")
    v-layout
      v-flex(xs4)
        tooltip(text="Add Integration" bottom)
          v-btn.ma-0(
            @click="clickOpenExplorer('INTEGRATION')"
            :color="buttonColorExplorer('INTEGRATION')"
            text block large
          )
            v-icon mdi-source-fork
      v-flex(xs4)
        tooltip(text="Add Widget" bottom)
          v-btn.ma-0(
            @click="clickOpenExplorer('WIDGET')"
            :color="buttonColorExplorer('WIDGET')"
            text block large
          )
            v-icon mdi-hexagon-multiple
      v-flex(xs4)
        tooltip(text="Dashboard Settings" bottom)
          v-btn.ma-0(
            @click="clickToggleSettings(null)"
            :color="isSettings ? 'white' : 'grey'"
            text block large
          )
            v-icon mdi-settings

    dashboard-integration-list(v-if="!isSettings")

  //------------------------------------

  //- Integration config menu
  v-scroll-x-transition(hide-on-leave)
    dashboard-integration-config(v-if="focusedIntegration")

  //- Widet config menu
  v-scroll-x-transition(hide-on-leave)
    dashboard-widget-config(v-if="focusedWidget")

  //- Settings menu
  v-scroll-x-transition(hide-on-leave)
    dashboard-settings(v-if="isSettings && !focusedIntegration && !focusedWidget")
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, Tooltip } from '@/components'
import {
  DashboardIntegrationList,
  DashboardIntegrationConfig,
  DashboardWidgetConfig,
  DashboardSettings
} from '@/components/dashboard'

export default {
  name: 'DashboardCtx',
  components: {
    ContextToolbar,
    Tooltip,
    DashboardIntegrationList,
    DashboardIntegrationConfig,
    DashboardWidgetConfig,
    DashboardSettings,
  },
  data: () => ({
    isSettings: false
  }),
  computed: {
    ...mapGetters('Dashboard', [
      'focusedIntegration',
      'focusedWidget'
    ]),
    ...mapState('Dashboard', [
      'loaded',
      'explorer',
      'isEditing',
      'isFullscreen',
      'isExploring'
    ]),
    editingIcon () {
      return this.isEditing
        ? 'mdi-lock'
        : 'mdi-cursor-move'
    },
    fullscreenIcon () {
      return this.isFullscreen
        ? 'mdi-fullscreen-exit'
        : 'mdi-fullscreen'
    }
  },
  methods: {
    ...mapActions('Dashboard', [
      'openExplorer',
      'closeExplorer'
    ]),
    ...mapMutations('Dashboard', [
      'DASHBOARD_SET_FOCUSED_WIDGET',
      'DASHBOARD_SET_FOCUSED_INTEGRATION',
      'DASHBOARD_SET_EDITING',
      'DASHBOARD_SET_FULLSCREEN'
    ]),
    buttonColorExplorer (type) {
      return this.isExploring && this.explorer.type === type
        ? 'white'
        : 'grey'
    },
    clickOpenExplorer (type) {
      this.clickToggleSettings(false)
      if (this.isExploring && this.explorer.type === type)
        this.closeExplorer()
      else
        this.openExplorer(type)
    },
    clickToggleSettings (val = null) {
      this.DASHBOARD_SET_FOCUSED_WIDGET(null)
      this.DASHBOARD_SET_FOCUSED_INTEGRATION(null)
      this.isSettings = val === null ? !this.isSettings : val

      if (this.isExploring && this.isSettings)
        this.closeExplorer()
    },
    goBack () {
      if (this.focusedWidget)
        this.DASHBOARD_SET_FOCUSED_WIDGET(null)
      else if (this.focusedIntegration)
        this.DASHBOARD_SET_FOCUSED_INTEGRATION(null)
      else if (this.isExploring)
        this.closeExplorer()
      else {
        this.DASHBOARD_SET_EDITING(false)
        this.$router.push('/app/d')
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
