<template lang="pug">
#dashboard-widget-config
  context-toolbar
    .subheading Edit Widget
  .pl-3.pr-3.pb-3
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
            v-icon mdi-close
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
              v-treeview#data-source-tree.mt-3(
                :active.sync="dataSource"
                :open.sync="dataSourceOpen"
                :items="dataTree"
                item-key="key"
                item-text="text"
                selected-color="red"
                activatable
              )
                template(
                  slot="label"
                  slot-scope="{ item }"
                )
                  span(v-html="item.text")

    v-expansion-panel.mt-3
      v-expansion-panel-content
        div(slot="header")
          v-avatar.mr-3(
            :size="30"
            :color="bgc"
          )
          | Background Color
        color-picker(v-model="bgc")

    input-types.mt-3(
      v-model="model"
      :config="config"
    )
</template>

<script>
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'
import isString from 'lodash-es/isString'
import { Chrome } from 'vue-color'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, InputTypes } from '@/components'
import { parseConfig, cloneDeep, dataTree } from '@/lib/utils'
import { fileContents } from '@/lib/utils/projectUtils'
import { IFrameHandler, WorkerHandler } from '@/service'
import EventBus from '@/lib/eventBus'

export default {
  name: 'DashboardWidgetConfig',
  components: {
    ContextToolbar,
    InputTypes,
    'color-picker': Chrome
  },
  data: () => ({
    model: {},
    dataTree: [],
    dataSource: [],
    dataSourceOpen: [],
    dialog: false
  }),
  computed: {
    ...mapGetters('Dashboard', ['focusedWidget', 'integrationByI']),
    ...mapGetters('Widget', ['parsedConfig']),

    /**
     * Focused widget BGC. Stored in widget
     * settings metadata.
     */
    bgc: {
      get () {
        const { r, g, b, a } = this.focusedWidget.settings.rgba
        return `rgba(${r}, ${g}, ${b}, ${a})`
      },
      set: debounce(function (val) {
        const { rgba } = val
        this.updateFocusedWidget({ settings: { rgba } })
      }, 20)
    },
    config () {
      return this.parsedConfig(this.focusedWidget.id)
    },
    widgetI () {
      return get(this.focusedWidget, 'i', null)
    }
  },
  watch: {
    widgetI: {
      immediate: true,
      handler (val) {
        if (!val)
          return

        const variables = get(this.config, 'variables', null)
        const configModel = variables.reduce((acc, cur) => {
          acc[cur.name] = cur.default || null
          return acc
        }, {})

        // Apply user input
        for (const name in this.focusedWidget.settings.config) {
          if (configModel.hasOwnProperty(name))
            configModel[name] = this.focusedWidget.settings.config[name]
        }
        this.model = configModel

        // Load data source
        this.loadDataSource()
      }
    },

    /**
     * Re-calculate data tree
     * when dialog is opened.
     */
    dialog: {
      handler (newVal, oldVal) {
        if (newVal && !oldVal)
          this.recalculateDataTree()
      }
    },

    /**
     * Watch when settings have changed by the user.
     */
    model: {
      deep: true,
      handler (config) {
        this.updateFocusedWidget({ settings: { config } })

        // Send config updates to IFrame
        IFrameHandler.postMessage('sendConfig', this.widgetI, config)
      }
    }
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_WIDGET']),
    ...mapActions('Dashboard', ['updateFocusedWidget']),

    recalculateDataTree () {
      this.dataTree = dataTree(WorkerHandler.data)

      // Convert top-leved ID's into integration names
      for (const integration of this.dataTree) {
        try {
          const { key } = integration
          integration.text = this.integrationByI(key).settings.label || key
        } catch (e) {
          continue
        }
      }
      console.log('recalculated')

      this.loadDataSource()
    },

    /**
     * Convenience method for instructing
     * dataTree how to open.
     */
    loadDataSource () {
      /**
       * Don't touch dataSource or dataSourceOpen when
       * user is actively involved.
       */
      if (this.dialog)
        return

      let { source } = this.focusedWidget.settings

      // Source is not a String (defaul is null)
      if (!isString(source))
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

    /**
     * Update Widget data source path when
     * dialog is closed.
     */
    updateDataSource () {
      this.dialog = false
      const source = this.dataSource[0]
      this.updateFocusedWidget({ settings: { source } })

      // Signal that Widget has updated its source
      IFrameHandler.onDataSourceChange(this.widgetI, source)
    }
  },
  mounted () {
    /**
     * Data from WorkerHandler has changed.
     * Re-calculate data tree and re-apply
     * dataSource on data tree.
     */
    EventBus.$on('vbox:dataChanged:config', this.recalculateDataTree)
  },
  beforeDestroy () {
    EventBus.$off('vbox:dataChanged:config')
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-widget-config
  .v-toolbar
    background transparent
    border-bottom 0

  .v-dialog__container
    display block !important
</style>
