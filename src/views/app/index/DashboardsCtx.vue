<template lang="pug">
#dashboards-ctx
  context-toolbar
    .subheading Dashboards
    v-spacer
    v-btn(
      icon
      @click="submit"
      :loading="isLoading"
      :disabled="isLoading"
    )
      v-icon mdi-plus-box

  //- List
  v-list(dense)
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      @mouseover="hoverIndex = index"
      @mouseout="hoverIndex = null"
      @click="$router.push(`/app/d/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
      v-list-tile-action(v-if="index === hoverIndex")
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="deleteDashboard(item.id)" small) mdi-trash-can-outline
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { ContextToolbar, Tooltip } from '@/components'

export default Vue.extend({
  name: 'DashboardsCtx',
  components: {
    ContextToolbar,
    Tooltip
  },
  data: () => ({
    hoverIndex: null
  }),
  computed: {
    ...mapState('App', ['isLoading']),
    ...mapState('Dashboard', ['list'])
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Dashboard', ['create', 'del']),
    deleteDashboard (id: string) {
      if (confirm('Are you sure you want to delete the dashboard?'))
        this.del(id)
    },
    async submit () {
      this.setIsLoading(true)
      try {
        await this.create()
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
      }
    }
  }
})
</script>
