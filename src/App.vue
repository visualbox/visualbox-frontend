<template lang="pug">
v-app(:dark="theme === 'dark'")
  base-snackbar
  base-toolbar

  router-view(v-if="sessionIsReady")
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions, mapGetters } from 'vuex'
import { BaseToolbar, BaseSnackbar } from '@/components/base'

export default Vue.extend({
  name: 'App',
  components: {
    BaseToolbar,
    BaseSnackbar
  },
  computed: {
    ...mapState('App', ['sessionIsReady']),
    ...mapGetters('App', ['theme'])
  },
  methods: mapActions('App', ['initSession']),
  async mounted () {
    try {
      await this.initSession()
    } catch (e) {
      // Silent
    }
  }
})
</script>
