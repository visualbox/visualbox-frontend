<template lang="pug">
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions } from 'vuex'

export default Vue.extend({
  name: 'SignOut',
  methods: {
    ...mapActions('App', ['setIsLoading', 'reset']),
    ...mapActions('Cognito', ['signOut'])
  },
  async mounted () {
    this.setIsLoading(true)
    try {
      await this.signOut()
      this.reset()
    } catch (e) {
      // Silent
    } finally {
      this.setIsLoading(false)
      this.$router.push('/')
    }
  }
})
</script>
