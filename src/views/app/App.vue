<template lang="pug">
#app(:class="{ 'fullscreen' : isFullscreen }")
  .grid-item
    navigation-drawer
  .grid-item.gutter(ref="gutter")
  .grid-item
    v-scroll-x-transition(mode="out-in")
      router-view(
        v-if="appIsReady"
        :class="{ 'no-transition': disableTransition }"
      )
</template>

<script>
import Split from 'split-grid'
import { mapState, mapActions } from 'vuex'
import { NavigationDrawer } from '@/components'
import { unauthGuard } from '@/mixins'

export default {
  name: 'App',
  components: { NavigationDrawer },
  mixins: [ unauthGuard ],
  data: () => ({
    split: null
  }),
  computed: {
    ...mapState('App', ['appIsReady']),
    ...mapState('Dashboard', ['isFullscreen']),
    ...mapState('Route', ['path']),
    disableTransition () {
      return [
        'dashboard'
      ].includes(this.name)
    }
  },
  methods: mapActions('App', ['setIsLoading', 'setSnackbar', 'initApp']),
  async mounted () {
    this.split = Split({
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
  },
  beforeDestroy () {
    split.destroy()
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

  &.fullscreen
    grid-template none / 100%
    grid-template-columns unset !important

    .grid-item:first-child, .grid-item:nth-child(2)
      display none

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
