<template lang="pug">
#dashboard-integration-list
  v-list.hover-actions(dense)
    v-list-tile(
      v-for="(item, index) in loaded.integrations"
      :key="index"
      @click="DASHBOARD_SET_FOCUSED_INTEGRATION(item.i)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
      v-list-tile-action
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="removeIntegration(item)" small) mdi-trash-can-outline
</template>

<script>
import get from 'lodash-es/get'
import { mapState, mapMutations, mapActions } from 'vuex'
import { Tooltip } from '@/components'
import { DashboardHandler } from '@/service'

export default {
  name: 'DashboardIntegrationList',
  components: { Tooltip },
  computed: mapState('Dashboard', ['loaded']),
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_INTEGRATION']),
    ...mapActions('Dashboard', ['removeIntegration'])
  }
}
</script>
