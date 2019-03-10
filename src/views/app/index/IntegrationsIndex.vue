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
      .subheading Existing integrations can be modified to your own needs.
      v-icon.index-icon mdi-source-fork

    //- Adding integration preconfig
    v-container(v-if="isAdding")
      .headline.mb-3 Name
      v-layout
        v-flex
          v-text-field(
            v-model="settings.name"
            hide-details single-line
            autofocus outline
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
          large outline
        ) Cancel
        v-btn.ma-0(
          :disabled="isLoading"
          :loading="isLoading"
          @click="submit"
          color="primary"
          large outline
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
      runtime: 'nodejs'
    }
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
    }
  },
  mounted () {
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
    EventBus.$off('vbox:addIntegration')
    EventBus.$off('vbox:toggleExplorer')
  }
}
</script>

<style lang="stylus" scoped>
.container
  .flex
    position relative
</style>
