<template lang="pug">
#dashboards
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

  v-list
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
    )
      v-list-tile-title {{ item.label }}
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'Dashboards',
  components: { AppContextToolbar },
  computed: {
    ...mapGetters('App', ['isLoading']),
    ...mapGetters('Dashboard', ['list'])
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Dashboard', ['create']),
    async submit () {
      this.setIsLoading(true)
      try {
        this.create()
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
#dashboards
  .v-list
    padding 0
</style>
