<template lang="pug">
.base-toolbar(v-if="isReady")
  v-toolbar.elevation-0(
    v-if="!isLoggedIn"
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
      outline
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
  v-system-bar(
    v-if="isLoggedIn"
    app dark
    fixed window
  )
    router-link(to="/auth/signout")
      base-link Logout
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'BaseToolbar',
  computed: {
    ...mapGetters('App', ['isReady']),
    ...mapGetters('Cognito', ['isLoggedIn']),
    ...mapState('Cognito', ['user'])
  },
  methods: {
    ...mapActions('App', ['setDrawer']),
    ...mapActions('Cognito', ['signOut'])
  }
}
</script>

<style lang="stylus" scoped>
.title
  cursor pointer
</style>
