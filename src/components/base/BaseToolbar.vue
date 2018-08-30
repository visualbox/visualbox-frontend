<template lang="pug">
v-toolbar.elevation-0(
  app dark
  color="#252525"
  absolute
  clipped-left
)
  v-toolbar-side-icon(@click="setDrawer(!drawer)")
  .title.ml-3 VISUALBOX
  v-spacer
  v-toolbar-items
    v-btn(
      to="/auth"
      flat
    ) Login
</template>

<script>
import mapApp from '@/mixins/mapApp'

export default {
  name: 'BaseToolbar',
  mixins: [ mapApp ]
}
</script>

<style lang="stylus" scoped>
.v-toolbar
  >>> .title
    color #ff0067 !important
</style>
