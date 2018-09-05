<template lang="pug">
v-navigation-drawer(
  app
  hide-overlay
  stateless
  permanent
  floating
)
  v-content
    span Context
</template>

<script>
export default {
  name: 'AppContextDrawer',
  data: () => ({
  })
}
</script>

<style lang="stylus" scoped>
.v-navigation-drawer
  margin-left 80px
  background-color #272727 !important
</style>
