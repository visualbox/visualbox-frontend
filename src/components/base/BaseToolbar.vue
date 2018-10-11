<template lang="pug">
.base-toolbar(v-if="showToolbar")
  v-toolbar(
    color="transparent"
    absolute flat
    clipped-left
  )
    v-toolbar-title.font-weight-regular(@click="$router.push('/')") VISUALBOX.IO
    v-spacer
    v-toolbar-items
      v-btn(
        to="/auth"
        flat exact
      ) Sign In
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
    }
  },
  methods: mapActions('Cognito', ['signOut'])
}
</script>

<style lang="stylus" scoped>
.base-toolbar
  .v-toolbar__title
    cursor pointer
  >>> .v-toolbar__content
    padding 0 0 0 16px !important
</style>
