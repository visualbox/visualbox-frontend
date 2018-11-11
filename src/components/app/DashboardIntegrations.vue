<template lang="pug">
#dashboard-integrations
  //- Available
  v-list(dense)
    v-subheader Available Integrations
    v-list-tile(
      v-for="(item, index) in availableIntegrations"
      :key="index"
      @mouseover="hoverAvailableIndex = index"
      @mouseout="hoverAvailableIndex = null"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
      v-list-tile-action(v-if="index === hoverAvailableIndex")
        v-btn(
          flat icon
          @click.stop="DASHBOARD_ADD_INTEGRATION(item.id)"
        )
          v-icon(small) mdi-arrow-down

  v-divider

  //- Added
  v-list(dense)
    v-subheader Added to Dashboard
    v-list-tile(
      v-for="(item, index) in dashboardIntegrations"
      :key="index"
      @mouseover="hoverDashboardIndex = index"
      @mouseout="hoverDashboardIndex = null"
      @click="DASHBOARD_SET_FOCUSED_INTEGRATION(item.i)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ integrationById(item.id).label }}
      v-list-tile-action(v-if="index === hoverDashboardIndex")
        v-btn(
          flat icon
          @click.stop="DASHBOARD_REMOVE_INTEGRATION(item.id)"
        )
          v-icon(small) mdi-arrow-up
</template>

<script>
import * as _ from 'lodash'
import { mapMutations, mapGetters } from 'vuex'
import WorkerHandler from '@/lib/workerHandler'

export default {
  name: 'DashboardIntegrations',
  data: () => ({
    hoverAvailableIndex: null,
    hoverDashboardIndex: null
  }),
  computed: {
    ...mapGetters('Dashboard', ['loaded']),
    ...mapGetters('Integration', ['list', 'integrationById']),
    dashboardIntegrations () {
      return _.get(this, 'loaded.integrations', [])
    },
    availableIntegrations () {
      return this.list.filter(i => {
        // Return true if not found (available)
        return (typeof this.dashboardIntegrations.find(j => j.id === i.id) === 'undefined')
      })
    }
  },
  watch: {
    // TODO: mechanism to register currently edited integration
    // so that its config gets updated
    dashboardIntegrations (newVal, oldVal) {
      if (_.isEqual(newVal, oldVal))
        return

      WorkerHandler.register(newVal)
    }
  },
  methods: {
    ...mapMutations('Dashboard', [
      'DASHBOARD_ADD_INTEGRATION',
      'DASHBOARD_REMOVE_INTEGRATION',
      'DASHBOARD_SET_FOCUSED_INTEGRATION'
    ])
  },
  mounted () {
    WorkerHandler.init(this.integrationById)
    WorkerHandler.register(this.dashboardIntegrations)
  },
  beforeDestroy () {
    WorkerHandler.end()
  }
}
</script>

<style lang="stylus" scoped>
</style>
