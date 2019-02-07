<template lang="pug">
#dashboard-add-integration
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
        :config="config"
      )
      v-btn(
        @click="submit"
        color="primary"
        outline block large
      ) Add
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, InputTypes } from '@/components'
import { WorkerHandler } from '@/service'
import { packageJson } from '@/lib/utils/projectUtils'

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
    ...mapState('Integration', ['list']),
    integrationList () {
      return this.list.map(integration => {
        return {
          id: integration.id,
          name: packageJson(integration, 'name', 'Untitled')
        }
      })
    },
    config () {
      return this.parsedConfig()(this.selectedId)
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
     * Create model by patching parsed
     * config defaults to it.
     */
    selectedId: {
      handler () {
        try {
          const variables = get(this.config, 'variables', null)
          this.model = variables.reduce((acc, cur) => {
            acc[cur.name] = cur.default || null
            return acc
          }, {})
        } catch (e) {
          console.log(e)
        }
      }
    }
  },
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapMutations('Dashboard', ['DASHBOARD_SET_ADDING_INTEGRATION']),
    ...mapActions('Dashboard', ['addIntegration']),
    ...mapGetters('Integration', ['parsedConfig']),
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
