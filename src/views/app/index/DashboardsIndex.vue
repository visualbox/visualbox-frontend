<template lang="pug">
v-container(fill-height fluid)
  v-layout(align-center justify-center)
    v-flex(
      v-if="!isAdding"
      xs12 sm12 md10 lg8 xl6
    )
      .display-3.mb-4 VisualBox
      .headline Welcome back!
      v-icon.index-icon mdi-creation

    //- Adding dashboard preconfig
    v-container.max-800(v-if="isAdding")
      .headline.mb-3 Name
      v-layout
        v-flex
          v-text-field(
            v-model="label"
            hide-details single-line
            autofocus outlined
          )
      v-layout.mt-4
        v-spacer
        v-btn.ma-0.mr-3(
          @click="isAdding = false"
          large outlined
        ) Cancel
        v-btn.ma-0(
          :disabled="isLoading"
          :loading="isLoading"
          @click="submit"
          color="primary"
          large outlined
        ) Create
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import EventBus from '@/lib/eventBus'

export default Vue.extend({
  name: 'DashboardsIndex',
  data: () => ({
    isAdding: false,
      label: ''
  }),
  computed: {
    ...mapState('Cognito', ['user']),
    ...mapState('App', ['isLoading'])
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Dashboard', ['create']),
    async submit () {
      if (!this.label || this.label === '')
        return

      this.setIsLoading(true)
      try {
        await this.create(this.label)
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
        this.isAdding = false
      }
    }
  },
  mounted () {
    EventBus.$on('vbox:addDashboard', () => {
      this.isAdding = true
    })
  },
  beforeDestroy () {
    EventBus.$off('vbox:addDashboard')
  }
})
</script>

<style lang="stylus" scoped>
.container
  .max-800
    max-width 800px !important

  .flex
    position relative
</style>
