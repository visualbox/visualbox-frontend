<template lang="pug">
#c-sign-in
  v-form(v-if="!mfaView")
    v-text-field(
      v-model="username"
      label="Username"
      @keyup.enter="signIn"
      autofocus
      required
    )
    v-text-field(
      v-model="password"
      label="Password"
      type="password"
      @keyup.enter="signIn"
      autofocus
      required
    )
    v-btn(
      flat
      @click="signIn"
    ) Sign In
  v-form(v-if="mfaView")
    v-text-field(
      v-model="code"
      label="Verification Code"
      @keyup.enter="confirm"
      autofocus
      required
    )
    v-btn(
      flat
      @click="confirm"
    ) Verify
</template>

<script>
import { Auth, Logger, JS } from 'aws-amplify'
const logger = new Logger('SignIn')

export default {
  name: 'SignIn',
  data: () => ({
    mfaView: false,
    user: null,
    username: '',
    password: '',
    code: ''
  }),
  methods: {
    async signIn () {
      try {
        this.user = await Auth.signIn(this.username, this.password)
        logger.debug('sign in success', this.user)
        // Commit user

        if (this.user.challengeName === 'SMS_MFA') {
          this.mfaView = true
          return
        }
        this.checkUser()
      } catch (e) {
        logger.debug('sign in error', e)
        this.handleError(e)
      }
    },
    async checkUser () {
      if (!this.user)
        return

      try {
        const data = await Auth.verifiedContact(this.user)
        logger.debug('verify result', data)
        // Commit user verification

        if (!JS.eEmpty(data.verified))
          this.$router.push('/')
        else
          this.$router.push('/auth/verifyContact')
      } catch (e) {
        logger.debug('check user error', e)
        this.handleError(e)
      }
    },
    async confirm () {
      try {
        await Auth.confirmSignIn(this.user, this.code)
        this.$router.push('/')
      } catch (e) {
        logger.debug('confirm error', e)
        this.handleError(e)
      }
    }
  }
}
</script>
