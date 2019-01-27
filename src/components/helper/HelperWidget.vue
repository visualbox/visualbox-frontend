<template lang="pug">
#helper-widget
  v-system-bar
    .subheading Console
    v-spacer
    v-toolbar-items
      v-icon(@click="WIDGET_SET_HELPER_LAYOUT('horizontal')") mdi-page-layout-footer
      v-icon(@click="WIDGET_SET_HELPER_LAYOUT('vertical')") mdi-page-layout-sidebar-right
  .foo >
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'HelperWidget',
  data: () => ({
  }),
  methods: mapMutations('Widget', ['WIDGET_SET_HELPER_LAYOUT'])
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#helper-widget
  height 100%
  background #000
</style>
