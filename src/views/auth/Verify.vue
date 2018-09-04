<template lang="pug">
base-card
  v-card-text.pa-5
    .text-xs-center.mb-5
      h1.headline.mb-3 Verify
      .subheading with the code sent to your email

    div
      v-text-field(
        v-model="email"
        :rules="[rules.required('Enter your email address')]"
        label="Email"
      )
    div
      v-text-field.mb-3(
        v-model="code"
        :rules="[rules.required('Enter your email address')]"
        label="Code"
        autofocus
      )

    v-layout(
      align-center
      justify-space-between
    )
      router-link(to="/auth/resend")
        base-link Resend verification
      base-btn.ma-0(
        :disabled="!code"
        :loading="isLoading"
        prominent
        depressed
        @click="submit"
      ) Next
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Verify',
  data: () => ({
    email: undefined,
    code: undefined,
    rules: {
      required: msg => v => !!v || msg
    }
  }),
  computed: mapGetters('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Cognito', ['confirmUser']),
    async submit () {
      this.setIsLoading(true)
      try {
        await this.confirmUser({
          username: this.email,
          code: this.code
        })
        this.setSnackbar({
          type: 'success',
          msg: `Account verified. You may now login`
        })
        this.$router.push('/auth')
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
</style>
