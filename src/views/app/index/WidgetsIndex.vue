<template lang="pug">
v-container(fill-height fluid)
  v-layout(align-center justify-center)
    v-flex(
      v-if="!isAdding && !isExploring"
      xs12 sm12 md10 lg8 xl6
    )
      .display-3.mb-6 Widgets
      .subheading Widgets are the building blocks of your dashboard.
      .subheading They are self-contained components that are fed data from integrations.
      .subheading You can create your own widgets, or search for already existing widgets.
      v-container.pa-0.mt-6(fluid grid-list-lg)
        v-layout(row wrap)
          v-flex(v-bind="cols")
            v-card(flat color="primary" @click="addWidget")
              v-list-item(three-line)
                v-list-item-content
                  v-list-item-title New Widget
                  v-list-item-subtitle Create a new widget from scratch.
                v-list-item-avatar
                  v-icon(x-large) mdi-star-four-points
          v-flex(v-bind="cols")
            v-card(flat @click="toggleExplorer")
              v-list-item(three-line)
                v-list-item-content
                  v-list-item-title Explore
                  v-list-item-subtitle Discover already made widgets.
                v-list-item-avatar
                  v-icon(x-large) mdi-search-web
          v-flex(v-bind="cols")
            v-card(flat href="https://docs.visualbox.io/widgets/" target="_new")
              v-list-item(three-line)
                v-list-item-content
                  v-list-item-title Documentation
                  v-list-item-subtitle Learn how to develop widgets.
                v-list-item-avatar
                  v-icon(x-large) mdi-launch
      v-icon.index-icon mdi-hexagon-multiple

    //- Adding widget preconfig
    v-container.max-800(v-if="isAdding")
      .headline.mb-3 Name
      v-layout
        v-flex
          v-text-field(
            v-model="settings.name"
            hide-details single-line
            autofocus outlined
          )
      .headline.mb-3.mt-4 Select Template
      v-layout
        v-flex
          v-select(
            v-model="template"
            :items="templates"
            :disabled="isLoading"
            item-text="text"
            item-value="template"
            hide-details single-line
            outlined
          )
            template(#selection="{ item }")
              v-icon.mr-3(:color="item.color") {{ item.icon }}
              span {{ item.text }}
            template(#item="{ item }")
              v-icon.mr-3(:color="item.color") {{ item.icon }}
              span {{ item.text }}
      v-layout.mt-4
        v-spacer
        v-btn.ma-0.mr-3(
          @click="isAdding = false"
          large outlined
        ) Cancel
        v-btn.ma-0(
          :disabled="isLoading"
          :loading="isLoading"
          @click="submit"
          color="primary"
          large outlined
        ) Create

  //- Explore widgets
  explorer(
    v-if="isExploring"
    :config="explorerConfig"
  )
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Explorer } from '@/components'
import { Zip } from '@/service'
import EventBus from '@/lib/eventBus'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'

export default {
  name: 'WidgetsIndex',
  components: { Explorer },
  data: () => ({
    isAdding: false,
    isExploring: false,
    explorerConfig: {
      type: 'WIDGET',
      local: false
    },
    settings: {
      name: ''
    },
    templates: [
      {
        text: 'HTML',
        template: 'widget-html',
        icon: 'mdi-language-html5',
        color: '#e44d26'
      }
    ],
    template: 'widget-html',

    // Responsive stuff
    resizeSensor: null,
    cols: { xs12: true }
  }),
  computed: mapState('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Widget', ['create', 'commitFiles']),
    async submit () {
      if (!this.settings.name || this.settings.name === '')
        return

      this.setIsLoading(true)
      try {
        const id = await this.create({ settings: this.settings })
        const blob = await Zip.loadTemplate(this.template)
        await this.commitFiles({ id, blob })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
        this.isAdding = false
      }
    },
    addWidget () {
      EventBus.$emit('vbox:addWidget')
    },
    toggleExplorer () {
      EventBus.$emit('vbox:toggleExplorer')
    },

    /**
     * Use custom resize watcher since Vuetify
     * won't detect element resize (only window).
     */
    onResize ({ width }) {
      const { xs, sm, md, lg } = this.$vuetify.breakpoint.thresholds
      const cols = (width >= lg || width >= md)
        ? 4
        : 12

      this.cols = { [`xs${cols}`]: true }
    }
  },
  mounted () {
    this.resizeSensor = new ResizeSensor(this.$el, this.onResize)
    EventBus.$on('vbox:addWidget', () => {
      this.isAdding = true
      this.isExploring = false
    })
    EventBus.$on('vbox:toggleExplorer', () => {
      this.isExploring = !this.isExploring
      this.isAdding = false
    })
  },
  beforeDestroy () {
    this.resizeSensor.detach()
    EventBus.$off('vbox:addWidget')
    EventBus.$off('vbox:toggleExplorer')
  }
}
</script>

<style lang="stylus" scoped>
.container
  .max-800
    max-width 800px !important

  .flex
    position relative

  .v-card
    z-index 10
</style>
