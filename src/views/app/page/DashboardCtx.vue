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
    :class="{ 'hidden' : focusedWidget }"
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

  #dashboard-ctx-edit(v-if="focusedWidget")
    app-context-toolbar
      .subheading Edit Widget
      v-spacer
      v-btn(
        icon
        @click="DASHBOARD_SET_FOCUSED(null)"
      )
        v-icon mdi-close
    .pa-3 {{ focusedWidget }}
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { mapMutations, mapActions, mapGetters } from 'vuex'
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
    ...mapGetters('Dashboard', ['loaded', 'focusedWidget']),
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
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED']),
    ...mapActions('Dashboard', ['updateLoaded'])
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-ctx
  .v-tabs
    &.hidden
      display none

  #dashboard-ctx-edit
    .v-toolbar
      background transparent
</style>
