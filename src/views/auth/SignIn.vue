<template lang="pug">
base-card
  v-card-text.pa-5
    .text-xs-center.mb-5
      h1.headline.mb-3 {{ tab ? 'Welcome' : 'Sign In' }}

      .welcome
        v-slide-y-transition(mode="out-in")
          v-chip(
            v-if="tab"
            outline
            color="white"
            @click.native="tab = 0"
          )
            v-icon(
              color="white"
              left
            ) account_circle
            span.body-2 {{ email }}
            v-icon(
              color="white"
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
          :tab="tab"
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
        this.$router.push('/app')
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
  height 352px

  .welcome
    height 40px
</style>
