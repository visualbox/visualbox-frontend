<template lang="pug">
#app
  app-navigation-drawer
  #content
    v-scroll-x-transition(mode="out-in")
      router-view(v-if="appIsReady")
</template>

<script>
import { mapState, mapActions } from 'vuex'
import unauthGuard from '@/mixins/unauthGuard'
import { AppNavigationDrawer } from '@/components/app'

export default {
  name: 'App',
  mixins: [ unauthGuard ],
  components: { AppNavigationDrawer },
  computed: mapState('App', ['appIsReady']),
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

  #content
    height 100%
    position relative
    overflow hidden
    transition none !important
    -webkit-transition none !important

    .container
      position absolute
      overflow auto
</style>
