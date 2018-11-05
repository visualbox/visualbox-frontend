<template lang="pug">
v-toolbar(dense flat)
  slot
</template>

<script>
export default {
  name: 'AppContextToolbar'
}
</script>

<style lang="stylus" scoped>
.v-toolbar
  white-space nowrap

  >>> .v-toolbar__content
    padding 0 16px !important
    
    .subheading
      overflow hidden
      text-overflow ellipsis
</style>
