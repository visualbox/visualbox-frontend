<template lang="pug">
#dashboard-add-integration(v-if="isAddingIntegration")
  context-toolbar
    .subheading Add Integration
  .pl-3.pr-3.pb-3
    v-select(
      :items="integrationList"
      v-model="selectedId"
      item-text="name"
      item-value="id"
      label="Select Integration"
      hide-details outline
    )

    template(v-if="selectedId")
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
        :config="parsedConfig"
      )
      v-btn(
        @click="submit"
        color="primary"
        outline block large
      ) Add
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, InputTypes } from '@/components'
import { WorkerHandler } from '@/service'
import { parseConfig } from '@/lib/utils'
import { packageJson, fileContents } from '@/lib/utils/projectUtils'

export default {
  name: 'DashboardAddIntegration',
  components: {
    ContextToolbar,
    InputTypes
  },
  data: () => ({
    selectedId: null,
    label: 'My Integration',
    model: {}
  }),
  computed: {
    ...mapState('Dashboard', ['isAddingIntegration']),
    ...mapState('Integration', ['list']),
    ...mapGetters('Integration', ['integrationById']),
    integrationList () {
      return this.list.map(integration => {
        return {
          id: integration.id,
          name: packageJson(integration, 'name', 'Untitled')
        }
      })
    },
    parsedConfig () {
      try {
        if (!this.selectedId)
          throw new Error('Unable to parse widget configuration')

        const integration = this.integrationById(this.selectedId)
        if (!integration.hasOwnProperty('files'))
          throw new Error('Unable to parse widget configuration')

        const contents = fileContents(integration.files, ['config.json'])
        if (!contents)
          throw new Error('Unable to parse widget configuration')

        return parseConfig(contents)
      } catch (e) {
        return { error: [e.message] }
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
    parsedConfig: {
      deep: true,
      handler (val) {
        if (!val || !this.parsedConfig.hasOwnProperty('variables'))
          return

        // Create local config model
        this.model = this.parsedConfig.variables.reduce((acc, cur) => {
          acc[cur.name] = cur.default || null
          return acc
        }, {})
      }
    },
    isAddingIntegration (newVal, oldVal) {
      // Closing
      if (!newVal && oldVal) {
        this.selectedId = null
        this.model = {}
      }
    }
  },
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapMutations('Dashboard', ['DASHBOARD_SET_ADDING_INTEGRATION']),
    ...mapActions('Dashboard', ['addIntegration']),
    async submit () {
      try {
        if (!this.label || this.label === '')
          return

        const integration = await this.addIntegration({
          id: this.selectedId,
          settings: this.settings
        })
        WorkerHandler.register([ integration ])
        this.DASHBOARD_SET_ADDING_INTEGRATION(false)
      } catch (e) {
        this.setSnackbar({
          type: 'warning',
          msg: `Unable to add integration`
        })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-add-integration
  .v-toolbar
    background transparent
    border-bottom 0
</style>
