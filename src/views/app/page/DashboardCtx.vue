<template lang="pug">
#dashboard-ctx(v-if="loaded")
  context-toolbar
    v-btn(@click="goBack" icon)
      v-icon mdi-menu-left
    .subheading {{ loaded.label }}
    template(v-if="!isExploring")
      v-spacer
      v-btn(@click="DASHBOARD_SET_FULLSCREEN(!isFullscreen)" icon)
        v-icon {{ fullscreenIcon }}
      v-btn(@click="DASHBOARD_SET_EDITING(!isEditing)" icon)
        v-icon {{ editingIcon }}

  template(v-if="!focusedIntegration && !focusedWidget")
    v-layout
      v-flex(xs4)
        tooltip(text="Add Integration" bottom)
          v-btn.ma-0(
            @click="openExplorer('INTEGRATION')"
            :color="addIntegrationColor"
            flat block large
          )
            v-icon mdi-tab-plus
      v-flex(xs4)
        tooltip(text="Add Widget" bottom)
          v-btn.ma-0(
            @click="openExplorer('WIDGET')"
            :color="addWidgetColor"
            flat block large
          )
            v-icon mdi-hexagon-slice-2
      v-flex(xs4)
        tooltip(text="Dashboard Settings" bottom)
          v-btn.ma-0(
            @click=""
            color="grey"
            flat block large
          )
            v-icon mdi-settings

    dashboard-integration-list

  //------------------------------------

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
    },
    addIntegrationColor () {
      return this.isExploring && this.explorer.type === 'INTEGRATION'
        ? 'white'
        : 'grey'
    },
    addWidgetColor () {
      return this.isExploring && this.explorer.type === 'WIDGET'
        ? 'white'
        : 'grey'
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
    goBack () {
      if (this.focusedWidget)
        this.DASHBOARD_SET_FOCUSED_WIDGET(null)
      else if (this.focusedIntegration)
        this.DASHBOARD_SET_FOCUSED_INTEGRATION(null)
      else if (this.isExploring)
        this.closeExplorer()
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
