<template lang="pug">
v-container(fluid fill-height)
  v-layout(align-center)
    v-flex(
      xs12
      sm12
      md10
      lg8
      xl6
      offset-xs0
      offset-sm0
      offset-md1
      offset-lg2
      offset-xl3
    )
      .display-3.mb-4 VisualBox
      .headline Welcome back, {{ user.attributes.name }}!
      v-icon.index-icon mdi-creation
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DashboardsIndex',
  computed: mapState('Cognito', ['user'])
}
</script>

<style lang="stylus" scoped>
.container
  .flex
    position relative
</style>
