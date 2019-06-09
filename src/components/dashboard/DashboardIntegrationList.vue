<template lang="pug">
#dashboard-integration-list
  v-list.hover-actions(dense)
    v-list-item(
      v-for="(item, index) in loaded.integrations"
      :key="index"
      @click="DASHBOARD_SET_FOCUSED_INTEGRATION(item.i)"
    )
      .status(:inited="isInited(item.i)")
      v-list-item-content
        v-list-item-subtitle {{ item.label }}
      v-list-item-action
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
  computed: mapState('Dashboard', ['loaded', 'initedIntegrations']),
  methods: {
    ...mapMutations('Dashboard', ['DASHBOARD_SET_FOCUSED_INTEGRATION']),
    ...mapActions('Dashboard', ['removeIntegration']),
    isInited (i) {
      return this.initedIntegrations.includes(i)
    }
  }
}
</script>

<style lang="stylus" scoped>
#dashboard-integration-list
  .status
    width 2px
    position absolute
    top 0; bottom 0; left 0;
    background #b10000

    &[inited]
      background #4caf50
</style>
