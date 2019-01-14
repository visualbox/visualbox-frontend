<template lang="pug">
#dashboards-ctx
  app-context-toolbar
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
  v-list
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      @mouseover="hoverIndex = index"
      @mouseout="hoverIndex = null"
      @click="$router.push(`/app/d/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
      v-list-tile-action(v-if="index === hoverIndex || true")
        v-btn(
          flat icon
          @click.stop="del(item.id)"
        )
          v-icon(small) mdi-trash-can-outline
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'DashboardsCtx',
  components: { AppContextToolbar },
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
}
</script>

<style lang="stylus" scoped>
#dashboards-ctx
  .v-list
    padding 0

    .v-list__tile__content
      cursor pointer
</style>
