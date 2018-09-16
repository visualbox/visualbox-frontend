<template lang="pug">
#dashboards
  v-list
    v-list-tile
      v-list-tile-content
        v-list-tile-title Dashboards
      v-list-tile-action
        v-icon mdi-plus-box
    v-divider
    v-list-tile
      v-list-tile-title Test
</template>

<script>
export default {
  name: 'Dashboards'
}
</script>

<style lang="stylus" scoped>
#dashboards
  .v-list
    padding 0
</style>
