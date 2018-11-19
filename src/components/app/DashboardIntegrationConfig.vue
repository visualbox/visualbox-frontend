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
    .mb-3(
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

    //- Integration config parse errors
    v-alert(
      v-for="(item, index) in config.error"
      :key="index"
      :value="true"
      type="error"
      outline
    ) {{ item }}
</template>

<script>
import * as _ from 'lodash'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'
import parseConfig from '@/lib/parseConfig'

export default {
  name: 'DashboardIntegrationConfig',
  components: { AppContextToolbar },
  data: () => ({ model: {} }),
  computed: {
    ...mapGetters('Dashboard', ['focusedIntegration']),
    ...mapGetters('Integration', ['integrationById']),
    config () {
      const { id } = this.focusedIntegration
      const integration = this.integrationById(id)
      return parseConfig(integration.config)
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
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_INTEGRATION']),
    ...mapActions('Dashboard', ['updateFocusedIntegration']),
    updateDynamicModel (val, variableName) {
      this.$set(this.model, variableName, val)
      this.model = _.cloneDeep(this.model)
      this.updateFocusedIntegration({ settings: { config: this.model } })
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-integration-config
  .v-toolbar
    background transparent
</style>
