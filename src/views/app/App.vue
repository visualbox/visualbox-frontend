<template lang="pug">
#app
  app-navigation-drawer
  v-content
    v-scroll-x-transition(mode="out-in")
      router-view(v-if="appIsReady")
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import unauthGuard from '@/mixins/unauthGuard'
import AppNavigationDrawer from '@/components/app/AppNavigationDrawer'

export default {
  name: 'App',
  mixins: [ unauthGuard ],
  components: { AppNavigationDrawer },
  computed: mapGetters('App', ['appIsReady']),
  methods: mapActions('App', ['setIsLoading', 'setSnackbar', 'initApp']),
  async mounted () {
    this.setIsLoading(true)
    try {
      await this.initApp()
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
</script>

<style lang="stylus" scoped>
#app
  height 100%

  & > .v-content
    height 100%
    margin-left 300px
    padding 0 !important
</style>
