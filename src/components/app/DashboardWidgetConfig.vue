<template lang="pug">
#dashboard-widget-config(v-if="focusedWidget")
  app-context-toolbar
    .subheading Edit Widget
    v-spacer
    v-btn(
      icon
      @click="DASHBOARD_SET_FOCUSED(null)"
    )
      v-icon mdi-close
  .pa-3
    v-expansion-panel
      v-expansion-panel-content
        div(slot="header")
          v-avatar.mr-3(
            :size="30"
            :color="bgc"
          )
          | Background Color
        color-picker(v-model="bgc")
</template>

<script>
import * as _ from 'lodash'
import { Chrome } from 'vue-color'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'DashboardWidgetConfig',
  components: {
    AppContextToolbar,
    'color-picker': Chrome
  },
  computed: {
    ...mapGetters('Dashboard', ['focusedWidget']),

    // Focused widget BGC
    bgc: {
      get () {
        const { r, g, b, a } = this.focusedWidget.config.rgba
        return `rgba(${r}, ${g}, ${b}, ${a})`
      },
      set: _.debounce(function (val) {
        const { rgba } = val
        this.updateFocused({ config: { rgba } })
      }, 20)
    }
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED']),
    ...mapActions('Dashboard', ['updateFocused'])
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-widget-config
  .v-toolbar
    background transparent
</style>
