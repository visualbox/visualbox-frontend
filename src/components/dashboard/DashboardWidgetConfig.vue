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
          v-btn(@click="dialog = false" icon)
            v-icon mdi-close
          v-toolbar-title Data Source
          v-spacer
          v-toolbar-items
            v-btn(@click="updateDataSource" flat) Save
        v-container.mt-5(fluid)
          v-layout(
            align-center
            justify-center
            fill-height row
          )
            v-flex(xs12 sm12 md10 lg8 xl6)
              v-treeview#data-source-tree.mt-3(
                :items="dataTree"
                :active.sync="active"
                :open.sync="open"
                item-key="key"
                item-text="text"
                activatable
              )
                template(slot="label" slot-scope="{ item }")
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
import isString from 'lodash-es/isString'
import debounce from 'lodash-es/debounce'
import { Chrome } from 'vue-color'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, InputTypes } from '@/components'
import { parseConfig, dataTree } from '@/lib/utils'
import { DashboardHandler, IFrameHandler } from '@/service'
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
    dialog: false,
    dataTree: [],
    active: [],
    open: []
  }),
  computed: {
    ...mapState('Dashboard', ['widgetConfigMap']),
    ...mapGetters('Dashboard', ['focusedWidget', 'integrationByI']),
    ...mapGetters('Widget', ['configMapById']),

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
      const { id, version } = this.focusedWidget
      let configMap

      // Local, fetch from store
      if (version === '^') {
        configMap = this.configMapById(id)

        // Something went wrong retieving local config map
        if (!configMap || typeof configMap === 'string') {
          const error = !configMap ? 'Unable to get config.json' : configMap
          return {
            error: [error],
            variables: []
          }
        }

      // Registry, fetch from config map
      } else {
        const hash = `${id}:${version}`
        configMap = this.widgetConfigMap[hash]
      }

      return parseConfig(configMap)
    },
    widgetI () {
      return get(this.focusedWidget, 'i', null)
    }
  },
  watch: {
    widgetI: {
      immediate: true,
      handler () {
        const variables = get(this.config, 'variables', [])
        const defaults = variables.reduce((acc, cur) => {
          acc[cur.name] = cur.default || null
          return acc
        }, {})

        // Apply user input
        for (const name in this.focusedWidget.model) {
          if (defaults.hasOwnProperty(name))
            defaults[name] = this.focusedWidget.model[name]
        }

        this.model = defaults
      }
    },

    /**
     * Watch when settings have changed by the user.
     */
    model: {
      deep: true,
      handler (model) {
        this.updateFocusedWidget({ model })

        // Send config updates to IFrame
        IFrameHandler.postMessage('sendConfig', this.widgetI, model)
      }
    },

    /**
     * Re-calculate data tree
     * when dialog is opened.
     */
    dialog: {
      handler (newVal, oldVal) {
        if (newVal && !oldVal) {
          this.recalculateDataTree()
          this.loadOpen()
        } else if (!newVal && oldVal) {
          this.dataTree = []
        }
      }
    },
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_WIDGET']),
    ...mapActions('Dashboard', ['updateFocusedWidget']),
    recalculateDataTree () {
      this.dataTree = dataTree(DashboardHandler.data)

      // Convert top-leved ID's into integration names
      for (const integration of this.dataTree) {
        try {
          const { key } = integration
          integration.text = this.integrationByI(key).label || key
        } catch (e) {
          continue
        }
      }
    },

    /**
     * Convenience method for instructing
     * dataTree how to open.
     */
    loadOpen () {
      let { source } = this.focusedWidget.settings

      // Source is not a String (defaul is null)
      if (!isString(source))
        source = ''

      this.active = [ source ]

      // Open tree all the way to the source leaf
      this.open = source.split('.').reduce((a, b) => {
        const path = a.length > 0
          ? a[a.length - 1] + '.' + b
          : b
        a.push(path)
        return a
      }, [])
    },

    /**
     * Update Widget data source path when
     * dialog is saved.
     */
    updateDataSource () {
      this.dialog = false
      const source = this.active[0]
      this.updateFocusedWidget({ settings: { source } })

      // Signal that Widget has updated its source
      IFrameHandler.onDataSourceChange(this.widgetI, source)
    }
  },
  mounted () {
    /**
     * Data from DashboardHandler has changed.
     * Re-calculate data tree if dialog is open.
     */
    EventBus.$on('vbox:dataChanged', () => {
      if (this.dialog)
        this.recalculateDataTree()
    })
  },
  beforeDestroy () {
    EventBus.$off('vbox:dataChanged')
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
