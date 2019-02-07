<template lang="pug">
#dashboard-integrations
  v-btn.ma-0(
    flat block large
    color="primary"
    @click="DASHBOARD_SET_ADDING_INTEGRATION(true)"
  ) Add Integration

  //- Added
  v-list.hover-actions(dense)
    v-list-tile(
      v-for="(item, index) in dashboardIntegrations"
      :key="index"
      @click="DASHBOARD_SET_FOCUSED_INTEGRATION(item.i)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.settings.label }}
      v-list-tile-action
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="removeIntegration(item.i)" small) mdi-trash-can-outline
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapGetters } from 'vuex'
import { Tooltip } from '@/components'
import { WorkerHandler } from '@/service'

export default {
  name: 'DashboardIntegrations',
  components: { Tooltip },
  computed: {
    ...mapState('Dashboard', ['loaded']),
    ...mapGetters('Integration', ['integrationById']),
    dashboardIntegrations () {
      return get(this, 'loaded.integrations', [])
    }
  },
  methods: {
    ...mapMutations('Dashboard', [
      'DASHBOARD_SET_ADDING_INTEGRATION',
      'DASHBOARD_REMOVE_INTEGRATION',
      'DASHBOARD_SET_FOCUSED_INTEGRATION'
    ]),
    removeIntegration (i) {
      this.DASHBOARD_REMOVE_INTEGRATION(i)
      WorkerHandler.end(i)
    }
  },
  mounted () {
    WorkerHandler.register(this.dashboardIntegrations)
  },
  beforeDestroy () {
    WorkerHandler.end()
  }
}
</script>
