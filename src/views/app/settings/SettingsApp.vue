<template lang="pug">
v-container(fluid fill-height)
  v-layout(column)
    .headline.mb-3 Theme
    v-switch(
      v-model="localTheme"
      @change="changeTheme"
      label="Light"
      color="primary"
      disabled
    )
</template>

<script lang="ts">
import Vue from 'vue'
import Auth from '@aws-amplify/auth'
import { mapState, mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  name: 'SettingsApp',
  data: () => ({
    localTheme: false
  }),
  computed: {
    ...mapState('Cognito', ['user']),
    ...mapGetters('App', ['theme'])
  },
  methods: {
    ...mapActions('Cognito', ['fetchSession']),
    ...mapActions('App', ['setSnackbar']),
    async changeTheme (val: boolean) {
      try {
        const theme = val ? 'light' : 'dark'
        await Auth.updateUserAttributes(this.user, {
          'custom:theme': theme
        })
        await this.fetchSession()
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      }
    }
  },
  mounted () {
    this.localTheme = this.theme !== 'dark'
  }
})
</script>

<style lang="stylus" scoped>
.container
  max-width 800px
</style>
