<template lang="pug">
v-container(fill-height fluid)
  v-layout(align-center justify-center)
    v-flex(
      v-if="!isAdding && !isExploring"
      xs12 sm12 md10 lg8 xl6
    )
      .display-3.mb-4 Integrations
      .subheading Integrations are the engines behind your dashboard.
      .subheading They fetch, process and format data to be displayed by widgets.
      .subheading You can create your own integration, or search for already existing integrations.
      v-container.pa-0.mt-4(fluid grid-list-lg)
        v-layout(row wrap)
          v-flex(v-bind="cols")
            v-card(flat color="primary" @click="addIntegration")
              v-list-item(three-line)
                v-list-item-content
                  v-list-item-title New Integration
                  v-list-item-subtitle Create a new integration from scratch.
                v-list-item-avatar
                  v-icon(x-large) mdi-star-four-points
          v-flex(v-bind="cols")
            v-card(flat @click="toggleExplorer")
              v-list-item(three-line)
                v-list-item-content
                  v-list-item-title Explore
                  v-list-item-subtitle Discover already made integrations.
                v-list-item-avatar
                  v-icon(x-large) mdi-search-web
          v-flex(v-bind="cols")
            v-card(flat href="https://docs.visualbox.io/integrations/" target="_new")
              v-list-item(three-line)
                v-list-item-content
                  v-list-item-title Documentation
                  v-list-item-subtitle Learn how to develop integrations.
                v-list-item-avatar
                  v-icon(x-large) mdi-launch
      v-icon.index-icon mdi-source-fork

    //- Adding integration preconfig
    v-container.max-800(v-if="isAdding")
      .headline.mb-3 Name
      v-layout
        v-flex
          v-text-field(
            v-model="settings.name"
            hide-details single-line
            autofocus outlined
          )
      .headline.mb-3.mt-4 Select Runtime
      v-layout
        v-flex
          select-runtime(
            v-model="settings.runtime"
            :loading="isLoading"
          )
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

  //- Explore integrations
  explorer.pa-0(
    v-if="isExploring"
    :config="explorerConfig"
  )
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { SelectRuntime, Explorer } from '@/components'
import EventBus from '@/lib/eventBus'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'

export default {
  name: 'IntegrationsIndex',
  components: {
    SelectRuntime,
    Explorer
  },
  data: () => ({
    isAdding: false,
    isExploring: false,
    explorerConfig: {
      type: 'INTEGRATION',
      local: false
    },
    settings: {
      name: '',
      runtime: 'node'
    },

    // Responsive stuff
    resizeSensor: null,
    cols: { xs12: true }
  }),
  computed: mapState('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Integration', ['create']),
    async submit () {
      if (!this.settings.name || this.settings.name === '')
        return

      this.setIsLoading(true)
      try {
        await this.create({ settings: this.settings })
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
    addIntegration () {
      EventBus.$emit('vbox:addIntegration')
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
      let cols = (width >= lg || width >= md)
        ? 4
        : 12

      this.cols = { [`xs${cols}`]: true }
    }
  },
  mounted () {
    this.resizeSensor = new ResizeSensor(this.$el, this.onResize)
    EventBus.$on('vbox:addIntegration', () => {
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
    EventBus.$off('vbox:addIntegration')
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
