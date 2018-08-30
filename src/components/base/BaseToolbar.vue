<template lang="pug">
v-toolbar.elevation-0(
  app dark
  color="#1bcea2"
  absolute
  clipped-left
)
  v-toolbar-side-icon.hidden-md-and-up.mr-3(@click="setDrawer(!drawer)")
  .title.font-weight-light(@click="$router.push('/')") VISUALBOX.IO
  v-spacer
  v-btn.mr-3.hidden-sm-and-down.black--text(
    to="/auth"
    color="white"
    depressed round
  ) Get Started
  v-toolbar-items.hidden-sm-and-down
    v-btn(
      to="/auth"
      flat
    ) Features
    v-btn(
      to="/auth"
      flat
    ) FAQ
    v-btn(
      to="/auth"
      flat
    ) Sign In
</template>

<script>
import mapApp from '@/mixins/mapApp'

export default {
  name: 'BaseToolbar',
  mixins: [ mapApp ]
}
</script>

<style lang="stylus" scoped>
</style>
