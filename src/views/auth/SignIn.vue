<template lang="pug">
base-card
  v-card-text.pa-12
    .text-center.mb-6
      h1.headline.mb-5 {{ model ? 'Welcome' : 'Sign In' }}

      .welcome
        v-slide-y-transition(mode="out-in")
          v-chip(
            v-if="model"
            outlined
            color="white"
            @click.native="model--"
          )
            v-icon(
              color="white"
              left
            ) mdi-account-circle
            span.body-2 {{ email }}
            v-icon(
              color="white"
              right
            ) mdi-menu-down
          .subheading(v-else) with your VisualBox account

    v-window(
      v-model="model"
      lazy
    )
      v-window-item
        partial-email(
          v-model="email"
          @next="model++"
        )
      v-window-item
        partial-password(
          v-model="password"
          :current="model"
          @prev="model--"
          @next="submit"
        )
  v-layout.pt-6(justify-center)
    router-link.grey--text.text--darken-1(to="/auth/forgot") Forgot password?
</template>

<script>
import { mapActions } from 'vuex'
import { BaseCard } from '@/components/base'

export default {
  name: 'SignIn',
  components: {
    BaseCard,
    PartialEmail: () => import('@/components/partial/PartialEmail'),
    PartialPassword: () => import('@/components/partial/PartialPassword')
  },
  data: () => ({
    model: 0,
    email: undefined,
    password: undefined
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
        this.$router.push('/app/d')
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
  height 330px

  .v-card__text
    overflow hidden

  .welcome
    height 40px
</style>
