<template lang="pug">
#dashboard-widget-config(v-if="focusedWidget")
  app-context-toolbar
    .subheading Edit Widget
    v-spacer
    v-btn(
      icon
      @click="DASHBOARD_SET_FOCUSED_WIDGET(null)"
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

    //- Widget config
    .mt-3(
      v-for="(field, index) in config.variables"
      :key="index"
    )
      //- Text type
      v-text-field(
        v-if="field.type === 'text'"
        v-model="model[field.name]"
        @input="v => updateDynamicModel(v, field.name)"
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

    //- Integration data tree
    v-treeview.mt-3(
      activatable
      :items="dataTree"
      item-key="key"
      item-text="text"
    )
      template(
        slot="prepend"
        slot-scope="{ item }"
      )
        v-icon {{ item.icon }}
</template>

<script>
import * as _ from 'lodash'
import { Chrome } from 'vue-color'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'
import parseConfig from '@/lib/parseConfig'

export default {
  name: 'DashboardWidgetConfig',
  components: {
    AppContextToolbar,
    'color-picker': Chrome
  },
  data: () => ({
    model: {}
  }),
  computed: {
    ...mapGetters('Dashboard', ['focusedWidget']),
    ...mapGetters('Widget', ['widgetById']),
    ...mapGetters('Data', ['dataTree']),

    // Focused widget BGC
    bgc: {
      get () {
        const { r, g, b, a } = this.focusedWidget.settings.rgba
        return `rgba(${r}, ${g}, ${b}, ${a})`
      },
      set: _.debounce(function (val) {
        const { rgba } = val
        this.updateFocusedWidget({ settings: { rgba } })
      }, 20)
    },
    config () {
      const { id } = this.focusedWidget
      const widget = this.widgetById(id)
      return parseConfig(widget.config)
    }
  },
  watch: {
    focusedWidget: {
      handler: function (newVal, oldVal) {
        // Don't load local config model if not changed
        if (newVal === null)
          return
        if ((newVal !== null && oldVal !== null) && newVal.i === oldVal.i)
          return

        // Create local config model
        let configModel = this.config.variables.reduce((acc, cur) => {
          acc[cur.name] = null
          return acc
        }, {})

        // Apply widget config model on local (true) model
        for (let name in this.focusedWidget.settings.config) {
          if (configModel.hasOwnProperty(name)) {
            configModel[name] = this.focusedWidget.settings.config[name]
          }
        }
        this.model = _.cloneDeep(configModel)
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_WIDGET']),
    ...mapActions('Dashboard', ['updateFocusedWidget']),
    updateDynamicModel (val, variableName) {
      this.$set(this.model, variableName, val)
      this.model = _.cloneDeep(this.model)
      this.updateFocusedWidget({ settings: { config: this.model } })
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-widget-config
  .v-toolbar
    background transparent

  .v-expansion-panel, .v-expansion-panel__container
    border-radius 4px

  .v-treeview
    max-height 600px
    border 2px solid #bebebe
    border-radius 4px
    overflow auto
</style>
