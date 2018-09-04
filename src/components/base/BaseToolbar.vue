<template lang="pug">
v-toolbar.elevation-0(
  app dark
  color="#1bcea2"
  absolute
  clipped-left
)
  v-toolbar-side-icon.hidden-md-and-up.mr-3(@click="setDrawer(!drawer)")
  .title.font-weight-regular(@click="$router.push('/')") VISUALBOX.IO
  v-spacer
  v-btn.mr-3.hidden-sm-and-down.black--text(
    to="/auth/signup"
    color="white"
    depressed round
  ) Get Started
  v-toolbar-items.hidden-sm-and-down
    v-btn(
      to="/features"
      flat
    ) Features
    v-btn(
      to="/faq"
      flat
    ) FAQ
    v-btn(
      to="/auth"
      flat
      exact
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
.title
  cursor pointer
</style>
