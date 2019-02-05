<template lang="pug">
#dashboard-integrations
  v-btn.ma-0(
    flat block large
    color="primary"
    @click="DASHBOARD_SET_ADDING_INTEGRATION(true)"
  ) Add Integration

  //- Added
  v-list(dense)
    v-list-tile(
      v-for="(item, index) in dashboardIntegrations"
      :key="index"
      @mouseover="hoverIndex = index"
      @mouseout="hoverIndex = null"
      @click="DASHBOARD_SET_FOCUSED_INTEGRATION(item.i)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.settings.label }}
      v-list-tile-action(v-if="index === hoverDashboardIndex")
        v-btn(
          flat icon
          @click.stop="removeIntegration(item.i)"
        )
          v-icon(small) mdi-minus-circle-outline
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapGetters } from 'vuex'
import { WorkerHandler } from '@/service'

export default {
  name: 'DashboardIntegrations',
  data: () => ({
    hoverIndex: null
  }),
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
    ...mapMutations('Data', [
      'DATA_SET_DATA',
      'DATA_CLEAN_DATA'
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

<style lang="stylus" scoped>
</style>
