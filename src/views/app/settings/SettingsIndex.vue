<template lang="pug">
v-container(fill-height)
  v-layout(align-center justify-center)
    v-container
      .headline.mb-3 User Information
      v-layout
        v-flex
          v-text-field(
            v-model="name"
            :disabled="loading.info"
            :rules="[rules.required('Enter full name')]"
            label="Full Name"
            outline
          )
      v-layout
        v-spacer
        v-btn.ma-0.px-3(
          :disabled="!validInfo"
          :loading="loading.info"
          @click="submitInfo"
          color="primary"
          large outline
        ) Update

      .headline.mb-3.mt-4 Change Email
      v-layout
        v-flex
          v-text-field(
            v-model="email"
            :disabled="loading.changeEmail"
            :rules="[rules.required('Enter email address')]"
            label="Email"
            outline
          )
      v-layout
        v-spacer
        v-btn.ma-0.px-3(
          :disabled="!validEmail"
          :loading="loading.changeEmail"
          @click="submitEmail"
          color="primary"
          large outline
        ) Change

      v-container.mt-4.pa-0(grid-list-lg)
        .headline.mb-3 Change Password
        v-layout(wrap)
          v-flex(xs12 sm6)
            v-text-field(
              v-model="password"
              :disabled="loading.changePassword"
              :rules="[rules.required('Enter your old password'), rules.pwdLength]"
              label="Old password"
              type="password"
              outline
            )
          v-flex(xs12 sm6)
            v-text-field(
              v-model="newPassword"
              :disabled="loading.changePassword"
              :rules="[rules.required('Enter a new password'), rules.pwdLength]"
              label="Confirm password"
              type="password"
              outline
            )
          v-flex.pb-4
            v-messages(:value="['Use a password with 6 or more characters']")
        v-layout
          v-spacer
          v-btn.ma-0.px-3(
            :disabled="!validPassword"
            :loading="loading.changePassword"
            @click="submitPassword"
            color="primary"
            large outline
          ) Change
</template>

<script>
import Auth from '@aws-amplify/auth'
import { mapState, mapActions } from 'vuex'
import { cloneDeep } from '@/lib/utils'

export default {
  name: 'SettingsIndex',
  data: () => ({
    name: undefined,
    email: undefined,
    password: undefined,
    newPassword: undefined,
    rules: {
      required: msg => v => !!v || msg,
      pwdLength: v => (!!v && v.length > 5) || 'Minimum 6 characters'
    },
    loading: {
      info: false,
      changeEmail: false,
      changePassword: false
    }
  }),
  computed: {
    ...mapState('Cognito', ['user']),
    validInfo () {
      return !!this.name
    },
    validEmail () {
      return !!this.email
    },
    validPassword () {
      return !!this.password &&
             this.password.length > 5 &&
             !!this.newPassword &&
             this.newPassword.length > 5
    }
  },
  methods: {
    ...mapActions('App', ['setSnackbar']),
    async submitInfo () {
      this.loading.info = true
      try {
        await Auth.updateUserAttributes(this.user, { name: this.name })
        this.setSnackbar({
          type: 'success',
          msg: 'Updated info'
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.loading.info = false
      }
    },
    async submitEmail () {
      this.loading.changeEmail = true
      try {
        await Auth.updateUserAttributes(this.user, { email: this.email })
        this.setSnackbar({
          type: 'success',
          msg: 'Check your inbox for instructions',
          timeout: 10000
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.loading.changeEmail = false
      }
    },
    async submitPassword () {
      this.loading.changePassword = true
      try {
        await Auth.changePassword(this.user, this.password, this.newPassword)
        this.setSnackbar({
          type: 'success',
          msg: 'Password changed'
        })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.loading.changePassword = false
      }
    }
  },
  async mounted () {
    try {
      const { attributes: { name, email } } = this.user
      this.name = cloneDeep(name)
      this.email = cloneDeep(email)
    } catch (e) {
      this.setSnackbar({
        type: 'error',
        msg: e.message
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.container
  max-width 800px
  padding 16px
</style>
