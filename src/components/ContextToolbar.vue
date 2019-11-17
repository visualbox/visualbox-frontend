<template lang="pug">
v-toolbar(dense flat)
  slot
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ContextToolbar'
})
</script>

<style lang="stylus" scoped>
@import '../assets/styles/colors'

.v-toolbar
  white-space nowrap
  background-color $vb-app-ctx-toolbar !important

  >>> .v-toolbar__content
    padding 0 5px 0 16px !important

    & > .tooltip-element:first-child
      margin 0 5px 0 -10px

    .subheading
      white-space nowrap
      overflow hidden
      text-overflow ellipsis
</style>
