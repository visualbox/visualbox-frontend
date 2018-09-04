<template lang="pug">
base-card
  v-card-text.pa-5
    .text-xs-center.mb-5
      h1.headline.mb-3 {{ tab ? 'Welcome' : 'Sign In' }}

      .id
        v-slide-y-transition(mode="out-in")
          v-chip(
            v-if="tab"
            outline
            @click.native="tab = 0"
          )
            v-icon(
              color="primary"
              left
            ) account_circle
            span.body-2 {{ email }}
            v-icon(
              color="black"
              right
            ) keyboard_arrow_down
          .subheading(v-else) with your VisualBox account

    v-tabs-items(v-model="tab")
      v-tab-item
        partial-email(
          v-model="email"
          @next="tab = 1"
        )
      v-tab-item
        partial-password(
          v-model="password"
          @next="submit"
        )
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'SignIn',
  components: {
    PartialEmail: () => import('@/components/partial/PartialEmail'),
    PartialPassword: () => import('@/components/partial/PartialPassword')
  },
  data: () => ({
    email: undefined,
    password: undefined,
    tab: 0
  }),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Cognito', ['signInUser']),
    async submit () {
      this.setIsLoading(true)
      try {
        await this.signInUser({
          username: this.email,
          password: this.password
        })
        this.setSnackbar({
          type: 'success',
          msg: `Successfully signed in user ${this.email}`
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.v-card
  height 370px

  .id
    height 40px
</style>
