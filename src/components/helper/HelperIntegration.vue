<template lang="pug">
vue-draggable-resizable#helper-integration(
  :draggable="false"
  :handles="handle"
  :min-width="100"
  :min-height="100"
  :active="true"
  :prevent-deactivation="true"
  :class="{ 'bottom' : snap === 'bottom' }"
)
  span >_ CONSOLE
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable'

export default {
  name: 'HelperIntegration',
  components: { VueDraggableResizable },
  data: () => ({
    // Change to Vuex state
    snap: 'right'
  }),
  computed: {
    handle () {
      return (this.snap === 'right') ? ['ml'] : ['mt']
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#helper-integration
  background $vb-drawer-ctx
  height 100% !important
  right 0
  left unset !important

  &.bottom
    width 100% !important
    bottom 0
    left 0 !important
    top unset !important

    >>>.handle
      width 100%
      height 10px
      cursor n-resize

  >>>.handle
    width 10px
    height 100%
    background transparent
    box-sizing border-box
    z-index 99
    cursor e-resize
    position absolute

    &.handle-ml
      left -5px
    &.handle-mt
      top -5px
</style>
