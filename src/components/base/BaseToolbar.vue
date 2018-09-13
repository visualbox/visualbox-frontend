<template lang="pug">
.base-toolbar(v-if="showToolbar")
  v-toolbar.elevation-0(
    v-if="!isLoggedIn"
    :dark="dark"
    color="transparent"
    absolute
    clipped-left
  )
    v-toolbar-side-icon.hidden-md-and-up.mr-3(@click="setDrawer(!drawer)")
    .title.font-weight-regular(@click="$router.push('/')") VISUALBOX.IO
    v-spacer
    v-toolbar-items.hidden-sm-and-down
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
    ...mapGetters('Cognito', ['isLoggedIn']),
    ...mapState('Cognito', ['user']),
    ...mapState('Route', ['path']),
    showToolbar () {
      return this.path.substr(0, 4) !== '/app'
    },
    dark () {
      return this.path === '/'
    }
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
