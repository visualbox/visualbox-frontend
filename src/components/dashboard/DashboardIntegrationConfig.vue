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
    v-btn(
      @click="submit"
      color="primary"
      outline block large
    ) Save
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, InputTypes } from '@/components'
import { cloneDeep, parseConfig } from '@/lib/utils'

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
    ...mapState('Dashboard', ['integrationConfigMap']),
    ...mapGetters('Dashboard', ['focusedIntegration']),
    ...mapGetters('Integration', ['configMapById']),
    config () {
      const { id, version } = this.focusedIntegration
      let configMap

      // Local, fetch from list
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
        configMap = this.integrationConfigMap[hash]
      }

      return parseConfig(configMap)
    }
  },
  methods: {
    ...mapActions('Dashboard', ['updateFocusedIntegration']),
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_INTEGRATION']),
    submit () {
      this.updateFocusedIntegration({
        label: this.label,
        model: this.model
      })
      this.DASHBOARD_SET_FOCUSED_INTEGRATION(null)
    }
  },

  /**
   * Monkey-patch integration defaults and
   * user input on model at mount.
   */
  mounted () {
    const { label, model } = this.focusedIntegration
    this.label = label
    this.model = cloneDeep(model)

    const variables = get(this.config, 'variables', [])
    const defaults = variables.reduce((acc, cur) => {
      acc[cur.name] = cur.default || null
      return acc
    }, {})

    // Apply user input
    for (const name in this.model) {
      if (defaults.hasOwnProperty(name))
        defaults[name] = this.model[name]
    }

    this.model = defaults
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-integration-config
  .v-toolbar
    background transparent
    border-bottom 0
</style>
