<template lang="pug">
#dashboards-ctx
  context-toolbar
    .subheading Dashboards
    v-spacer
    tooltip(text="New Dashboard" :open-delay="800" bottom)
      v-btn(
        @click="addDashboard"
        :loading="isLoading"
        :disabled="isLoading"
        text fab small
      )
        v-icon mdi-plus-box

  //- List
  v-list.hover-actions(dense)
    v-list-item(
      v-for="(item, index) in list"
      :key="index"
      @click="$router.push(`/app/d/${item.id}`)"
    )
      v-list-item-content
        v-list-item-subtitle {{ item.label }}
      v-list-item-action
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="deleteDashboard(item.id)" small) mdi-trash-can-outline
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { ContextToolbar, Tooltip } from '@/components'
import EventBus from '@/lib/eventBus'

export default Vue.extend({
  name: 'DashboardsCtx',
  components: {
    ContextToolbar,
    Tooltip
  },
  computed: {
    ...mapState('App', ['isLoading']),
    ...mapState('Dashboard', ['list'])
  },
  methods: {
    ...mapActions('Dashboard', ['del']),
    addDashboard () {
      EventBus.$emit('vbox:addDashboard')
    },
    deleteDashboard (id: string) {
      if (confirm('Are you sure you want to delete the dashboard?'))
        this.del(id)
    }
  }
})
</script>
