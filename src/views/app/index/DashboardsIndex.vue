<template lang="pug">
v-container(fill-height)
  v-layout(align-center justify-center)
    v-flex(xs12 sm12 md10 lg8 xl6)
      .display-3.mb-4 VisualBox
      .headline Welcome back!
      v-icon.index-icon mdi-creation
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  name: 'DashboardsIndex',
  computed: mapState('Cognito', ['user'])
})
</script>

<style lang="stylus" scoped>
.container
  max-width 800px

  .flex
    position relative
</style>
