<template lang="pug">
#app
  vue-draggable-resizable(
    :draggable="false"
    :w="380"
    :min-width="80"
    :handles="['mr']"
    :active="true"
    :prevent-deactivation="true"
  )
    app-navigation-drawer
  #content
    v-scroll-x-transition(mode="out-in")
      router-view(v-if="appIsReady")
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable'
import { mapState, mapActions } from 'vuex'
import unauthGuard from '@/mixins/unauthGuard'
import { AppNavigationDrawer } from '@/components/app'

export default {
  name: 'App',
  mixins: [ unauthGuard ],
  components: {
    VueDraggableResizable,
    AppNavigationDrawer
  },
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

  >>> .vdr
    position relative !important
    height 100% !important
    touch-action none
    box-sizing border-box
    float left

    .handle
      width 10px
      height 100%
      background transparent
      position absolute
      box-sizing border-box
      z-index 99

    .handle-mr
      right -5px
      cursor e-resize

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
