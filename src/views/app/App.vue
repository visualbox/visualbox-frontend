<template lang="pug">
#app
  .grid-item
    navigation-drawer
  .grid-item.gutter(ref="gutter")
  .grid-item
    v-scroll-x-transition(mode="out-in")
      router-view(v-if="appIsReady")
</template>

<script>
import Split from 'split-grid'
import { mapState, mapActions } from 'vuex'
import { unauthGuard } from '@/mixins'
import { NavigationDrawer } from '@/components'

export default {
  name: 'App',
  mixins: [ unauthGuard ],
  components: { NavigationDrawer },
  computed: mapState('App', ['appIsReady']),
  methods: mapActions('App', ['setIsLoading', 'setSnackbar', 'initApp']),
  async mounted () {
    Split({
      columnGutters: [{
        track: 1,
        element: this.$refs.gutter
      }],
      columnMinSizes: { 0: 60 }
    })

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
@import '../../assets/styles/colors';

#app
  display grid
  grid-template none / 1fr 0 3fr
  position absolute
  top 0; right 0; left 0; bottom 0;

  .grid-item
    position relative
    overflow-y auto
    overflow-x hidden

    &.gutter
      width 10px
      margin-left -5px
      z-index 10

      &:hover
        cursor col-resize
</style>
