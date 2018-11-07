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
    .mt-3(
      v-for="(field, index) in config.variables"
      :key="index"
    )
      v-text-field(
        v-if="field.type === 'text'"
        :label="field.label"
        hide-details
        outline
      )

    //- Widget config parse errors
    v-alert.mt-3(
      v-for="(item, index) in config.error"
      :key="index"
      :value="true"
      type="error"
      outline
    ) {{ item }}
</template>

<script>
import * as _ from 'lodash'
import { Chrome } from 'vue-color'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'
import parseWidgetConfig from '@/lib/parseWidgetConfig'

export default {
  name: 'DashboardWidgetConfig',
  components: {
    AppContextToolbar,
    'color-picker': Chrome
  },
  computed: {
    ...mapGetters('Dashboard', ['focusedWidget']),
    ...mapGetters('Widget', ['widgetById']),

    // Focused widget BGC
    bgc: {
      get () {
        const { r, g, b, a } = this.focusedWidget.settings.rgba
        return `rgba(${r}, ${g}, ${b}, ${a})`
      },
      set: _.debounce(function (val) {
        const { rgba } = val
        this.updateFocused({ settings: { rgba } })
      }, 20)
    },
    config () {
      const { id } = this.focusedWidget
      const widget = this.widgetById(id)
      return parseWidgetConfig(widget.config)
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
