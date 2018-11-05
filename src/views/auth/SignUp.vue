<template lang="pug">
base-card
  v-card-text.pa-5
    .text-xs-center.mb-5
      h2.headline.primary--text.mb-3 VisualBox
      .subheading.mb-5 Create an account to get started

    v-form(
      v-model="form"
      ref="form"
    )
      v-container.pa-0
        v-layout.pb-4(wrap)
          v-flex(xs12 sm6)
            v-text-field(
              v-model="firstName"
              :rules="[rules.required('Enter first name')]"
              label="First name"
              autofocus
            )
          v-flex(xs12 sm6)
            v-text-field(
              v-model="lastName"
              :rules="[rules.required('Enter last name')]"
              label="Last name"
            )
          v-flex(xs12)
            v-text-field(
              v-model="email"
              :rules="[rules.required('Enter your email address')]"
              label="Email"
              hint="You can use letters, numbers & periods"
              persistent-hint
            )
          v-flex(xs12 sm6)
            v-text-field(
              v-model="password"
              :rules="[rules.required('Enter a password')]"
              label="Password"
              type="password"
            )
          v-flex(xs12 sm6)
            v-text-field(
              v-model="confirmPassword"
              :rules="[rules.required('Confirm your password'), rules.confirm]"
              append-outer-icon="remove_red_eye"
              label="Confirm password"
              type="password"
            )
          v-flex.pa-0(xs12)
            v-messages(:value="['Use 8 or more characters with a mix of letters, numbers & symbols']")

        v-layout.pt-5(
          alig-center
          justify-space-between
        )
          v-btn.ma-0(
            to="/auth"
            color="primary"
            outline
          ) Sign in instead
          v-btn.ma-0(
            :disabled="!form"
            :loading="isLoading"
            @click="submit"
            color="primary"
            prominent depressed
          ) Next
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { BaseCard } from '@/components/base'

export default {
  name: 'SignUp',
  components: { BaseCard },
  data () {
    const data = {
      form: false,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      password: undefined,
      confirmPassword: undefined,
      rules: {
        required: msg => v => !!v || msg,
        confirm: v => (!!v && v === this.password) || 'Passwords do not match'
      }
    }

    return data
  },
  computed: mapGetters('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Cognito', ['registerUser']),
    async submit () {
      if (!this.$refs.form.validate())
        return

      this.setIsLoading(true)
      try {
        await this.registerUser({
          username: this.email,
          password: this.password,
          attributes: {
            name: `${this.firstName} ${this.lastName}`,
            email: this.email
          }
        })
        this.setSnackbar({
          type: 'success',
          msg: 'Account created. Check your email for verification'
        })
        this.$router.push('/auth/verify')
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message,
          timeout: 10000
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
