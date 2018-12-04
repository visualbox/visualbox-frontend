<template lang="pug">
#dashboard-integration-config(v-if="focusedIntegration")
  app-context-toolbar
    .subheading Edit Integration
    v-spacer
    v-btn(
      icon
      @click="DASHBOARD_SET_FOCUSED_INTEGRATION(null)"
    )
      v-icon mdi-close
  .pa-3
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
import * as _ from 'lodash'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar, InputTypes } from '@/components/app'
import WorkerHandler from '@/lib/workerHandler'
import parseConfig from '@/lib/parseConfig'

export default {
  name: 'DashboardIntegrationConfig',
  components: {
    AppContextToolbar,
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

        // Apply integration config model on local (true) model
        for (let name in this.focusedIntegration.settings.config) {
          if (configModel.hasOwnProperty(name)) {
            configModel[name] = this.focusedIntegration.settings.config[name]
          }
        }
        this.model = _.cloneDeep(configModel)
        this.label = _.cloneDeep(this.focusedIntegration.settings.label)
      },
      deep: true
    },
    settings: {
      handler: function (settings) {
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
    restartFocusedWorker: _.debounce(function (integration) {
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
</style>
