<template lang="pug">
#helper-integration
  v-system-bar
    .subheading Console
    v-spacer
    v-toolbar-items
      v-icon(@click="INTEGRATION_SET_HELPER_LAYOUT('horizontal')") mdi-page-layout-footer
      v-icon(@click="INTEGRATION_SET_HELPER_LAYOUT('vertical')") mdi-page-layout-sidebar-right
  .foo >
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  name: 'HelperIntegration',
  data: () => ({
  }),
  methods: mapMutations('Integration', ['INTEGRATION_SET_HELPER_LAYOUT'])
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#helper-integration
  height 100%
  background #000
</style>
