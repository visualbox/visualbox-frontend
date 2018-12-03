<template lang="pug">
#dashboard-add-integration(v-if="isAddingIntegration")
  app-context-toolbar
    .subheading Add Integration
    v-spacer
    v-btn(
      icon
      @click="DASHBOARD_SET_ADDING_INTEGRATION(false)"
    )
      v-icon mdi-close
  .pa-3
    v-select(
      :items="list"
      v-model="selectedId"
      item-text="label"
      item-value="id"
      label="Select Integration"
      hide-details outline
    )

    template(v-if="config")
      v-text-field.mt-3.mb-3(
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
      ) Add
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'
import { AppContextToolbar, InputTypes } from '@/components/app'
import parseConfig from '@/lib/parseConfig'

export default {
  name: 'DashboardAddIntegration',
  components: {
    AppContextToolbar,
    InputTypes
  },
  data: () => ({
    selectedId: null,
    label: 'My Integration',
    model: {}
  }),
  computed: {
    ...mapState('Dashboard', ['isAddingIntegration']),
    ...mapGetters('Integration', ['list', 'integrationById']),
    config () {
      try {
        if (!this.selectedId)
          return null
        const integration = this.integrationById(this.selectedId)
        return parseConfig(integration.config)
      } catch (e) {
        return null
      }
    },
    settings () {
      return {
        label: this.label,
        config: this.model
      }
    }
  },
  watch: {
    selectedId: {
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

        this.model = _.cloneDeep(configModel)
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations('Dashboard', [
      'DASHBOARD_SET_ADDING_INTEGRATION',
      'DASHBOARD_ADD_INTEGRATION'
    ]),
    submit () {
      if (!this.label || this.label === '')
        return
      this.DASHBOARD_ADD_INTEGRATION({
        id: this.selectedId,
        settings: this.settings
      })
      this.DASHBOARD_SET_ADDING_INTEGRATION(false)
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-add-integration
  .v-toolbar
    background transparent
</style>
