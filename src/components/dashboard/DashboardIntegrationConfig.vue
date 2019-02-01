<template lang="pug">
#dashboard-integration-config(v-if="focusedIntegration")
  context-toolbar
    .subheading Edit Integration
  .pl-3.pr-3.pb-3
    v-text-field.mb-3(
      v-model="label"
      :rules="[v => !!v || 'Required']"
      label="Name"
      color="primary"
      required outline
      hide-details
    )
    input-types(
      v-model="model"
      :config="config"
    )
</template>

<script>
import debounce from 'lodash-es/debounce'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, InputTypes } from '@/components'
import { WorkerHandler } from '@/service'
import { parseConfig, cloneDeep } from '@/lib/utils'

export default {
  name: 'DashboardIntegrationConfig',
  components: {
    ContextToolbar,
    InputTypes
  },
  data: () => ({
    model: {},
    label: ''
  }),
  computed: {
    ...mapGetters('Dashboard', ['focusedIntegration']),
    ...mapGetters('Integration', ['integrationById']),
    config () {
      const { id } = this.focusedIntegration
      const integration = this.integrationById(id)
      return parseConfig(integration.config)
    },
    settings () {
      return {
        label: this.label,
        config: this.model
      }
    }
  },
  watch: {
    focusedIntegration: {
      handler (newVal, oldVal) {
        // Don't load local config model if not changed
        if (newVal === null)
          return
        if ((newVal !== null && oldVal !== null) && newVal.i === oldVal.i)
          return

        // Create local config model
        const configModel = this.config.variables.reduce((acc, cur) => {
          acc[cur.name] = cur.default || null
          return acc
        }, {})

        // Apply integration config model on local (true) model
        for (const name in this.focusedIntegration.settings.config) {
          if (configModel.hasOwnProperty(name))
            configModel[name] = this.focusedIntegration.settings.config[name]
        }
        this.model = cloneDeep(configModel)
        this.label = cloneDeep(this.focusedIntegration.settings.label)
      },
      deep: true
    },
    settings: {
      handler (settings) {
        this.updateFocusedIntegration({ settings })
        // Send argument bcs debounce may fire when this.focusedIntegration value is gone
        this.restartFocusedWorker(this.focusedIntegration)
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_INTEGRATION']),
    ...mapActions('Dashboard', ['updateFocusedIntegration']),
    restartFocusedWorker: debounce(integration => {
      // Restart worker
      WorkerHandler.end(integration.i)
      WorkerHandler.register([ integration ])
    }, 3000)
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-integration-config
  .v-toolbar
    background transparent
    border-bottom 0
</style>
