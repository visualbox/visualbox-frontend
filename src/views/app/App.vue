<template lang="pug">
#app
  multipane
    .pane(:style="pane1")
      navigation-drawer
    multipane-resizer
    .pane(:style="pane2")
      v-scroll-x-transition(mode="out-in")
        router-view(v-if="appIsReady")
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane'
import { mapState, mapActions } from 'vuex'
import unauthGuard from '@/mixins/unauthGuard'
import { NavigationDrawer } from '@/components'

export default {
  name: 'App',
  mixins: [ unauthGuard ],
  components: {
    Multipane,
    MultipaneResizer,
    NavigationDrawer
  },
  data: () => ({
    pane1: {
      width: '380px',
      minWidth: '80px'
    },
    pane2: {
      flexGrow: 1
    }
  }),
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
</style>
