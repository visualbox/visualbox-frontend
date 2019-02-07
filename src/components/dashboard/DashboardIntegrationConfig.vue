<template lang="pug">
#dashboard-integration-config
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
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, InputTypes } from '@/components'
import { WorkerHandler } from '@/service'
import { parseConfig } from '@/lib/utils'
import { fileContents } from '@/lib/utils/projectUtils'

export default {
  name: 'DashboardIntegrationConfig',
  components: {
    ContextToolbar,
    InputTypes
  },
  data: () => ({
    label: '',
    model: {}
  }),
  computed: {
    ...mapGetters('Dashboard', ['focusedIntegration']),
    ...mapGetters('Integration', ['parsedConfig']),
    config () {
      return this.parsedConfig(this.focusedIntegration.id)
    },
    settings () {
      return {
        label: this.label,
        config: this.model
      }
    }
  },
  watch: {
    /**
     * Watch when settings have changed by the user.
     */
    settings: {
      deep: true,
      handler (settings) {
        this.updateFocusedIntegration({ settings })

        /**
         * Send argument because debounce may fire
         * when this.focusedIntegration value is gone.
         */
        this.restartFocusedWorker(this.focusedIntegration)
      }
    }
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_INTEGRATION']),
    ...mapActions('Dashboard', ['updateFocusedIntegration']),
    restartFocusedWorker: debounce(integration => {
      WorkerHandler.end(integration.i)
      WorkerHandler.register([ integration ])
    }, 2000)
  },

  /**
   * Monkey-patch integration defaults and
   * user input on model at mount.
   */
  mounted () {
    try {
      const variables = get(this.config, 'variables', null)
      const configModel = variables.reduce((acc, cur) => {
        acc[cur.name] = cur.default || null
        return acc
      }, {})

      // Apply user input
      for (const name in this.focusedIntegration.settings.config) {
        if (configModel.hasOwnProperty(name))
          configModel[name] = this.focusedIntegration.settings.config[name]
      }
      this.model = configModel
      this.label = this.focusedIntegration.settings.label
    } catch (e) {
      console.log()
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-integration-config
  .v-toolbar
    background transparent
    border-bottom 0
</style>
