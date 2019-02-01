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
        v-btn(
          flat icon
          @click.stop="del(item.id)"
        )
          v-icon(small) mdi-trash-can-outline
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { ContextToolbar } from '@/components'

export default Vue.extend({
  name: 'DashboardsCtx',
  components: { ContextToolbar },
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
