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
  >>> .v-toolbar__content
    padding 0 16px !important
</style>
