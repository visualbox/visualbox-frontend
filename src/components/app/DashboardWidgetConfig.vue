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
    v-dialog(
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    )
      v-expansion-panel(slot="activator")
        v-expansion-panel-content(expand-icon="")
          div(slot="header")
            v-icon(small).ml-2.mr-4 mdi-code-braces
            | Data Source
      v-card
        v-toolbar(fixed)
          v-btn(
            icon
            @click="dialog = false"
          )
            v-icon close
          v-toolbar-title Data Source
          v-spacer
          v-toolbar-items
            v-btn(
              flat
              @click="updateDataSource"
            ) Save
        v-container.mt-5(fluid)
          v-layout(
            row
            align-center
            justify-center
            fill-height
          )
            v-flex(xs12 sm12 md10 lg8 xl6)
              //- Integration data tree
              v-treeview.mt-3(
                :active.sync="dataSource"
                :open="dataSourceOpen"
                :items="dataTree"
                item-key="key"
                item-text="text"
                activatable
              )
                template(
                  slot="prepend"
                  slot-scope="{ item }"
                )
                  v-icon {{ item.icon }}

    v-expansion-panel.mt-3
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
      //- Text/password type
      v-text-field(
        v-if="field.type === 'text' || field.type === 'password'"
        v-model="model[field.name]"
        @input="v => updateDynamicModel(v, field.name)"
        :label="field.label"
        :type="field.type"
        hide-details
        outline
      )
      //- Switch type
      v-switch(
        v-if="field.type === 'switch'"
        v-model="model[field.name]"
        @change="v => updateDynamicModel(v, field.name)"
        :label="field.label"
        :type="field.type"
        color="primary"
        hide-details
      )
      //- Slider type
      v-slider(
        v-if="field.type === 'slider'"
        v-model="model[field.name]"
        @change="v => updateDynamicModel(v, field.name)"
        :hint="field.label"
        :max="field.max"
        :min="field.min"
        :thumb-size="24"
        thumb-label
        persistent-hint
      )
      //- Select type
      v-select(
        v-if="field.type === 'select'"
        v-model="model[field.name]"
        @change="v => updateDynamicModel(v, field.name)"
        :items="field.options"
        :label="field.label"
        item-text="label"
        item-value="value"
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
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'
import parseConfig from '@/lib/parseConfig'
import IFrameHandler from '@/lib/iframeHandler'

export default {
  name: 'DashboardWidgetConfig',
  components: {
    AppContextToolbar,
    'color-picker': Chrome
  },
  data: () => ({
    model: {},
    dataSource: [],
    dataSourceOpen: [],
    dialog: false
  }),
  computed: {
    ...mapGetters('Dashboard', ['focusedWidget']),
    ...mapGetters('Widget', ['widgetById']),
    ...mapGetters('Data', ['dataTree']),
    ...mapState('Data', ['data']),

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
          acc[cur.name] = cur.default || null
          return acc
        }, {})

        // Apply widget config model on local (true) model
        for (let name in this.focusedWidget.settings.config) {
          if (configModel.hasOwnProperty(name)) {
            configModel[name] = this.focusedWidget.settings.config[name]
          }
        }
        this.model = _.cloneDeep(configModel)

        // Load data source
        this.loadDataSource()
      },
      deep: true
    },

    // Re-apply dataSource on data tree when it changes (aka. is loaded)
    dataTree: {
      handler: function () {
        if (this.focusedWidget === null)
          return
        this.loadDataSource()
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

      // Send config updates to IFrame
      IFrameHandler.postMessage('sendConfig', this.focusedWidget.i, this.model)
    },

    // Convenience method for instructing dataTree how to open
    loadDataSource () {
      let { source } = this.focusedWidget.settings

      // Source is not a String (defaul is null)
      if (!_.isString(source))
        source = ''

      this.dataSource = [ source ]

      // Open tree all the way to the source leaf
      this.dataSourceOpen = source.split('.').reduce((a, b) => {
        const path = a.length > 0
          ? a[a.length - 1] + '.' + b
          : b
        a.push(path)
        return a
      }, [])
    },

    // Update data source path when dialog is closed
    updateDataSource () {
      this.dialog = false
      const source = this.dataSource[0]
      this.updateFocusedWidget({ settings: { source } })

      // Send data source data updates to IFrame
      IFrameHandler.onDataSourceChange(this.focusedWidget, this.data)
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-widget-config
  .v-toolbar
    background transparent

  .v-dialog__container
    display block !important

  .v-expansion-panel, .v-expansion-panel__container
    border-radius 4px
</style>
