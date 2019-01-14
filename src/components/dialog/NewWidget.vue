<template lang="pug">
v-dialog(
  v-model="internalValue"
  max-width="500"
  scrollable
)
  base-card(:loading="isLoading")
    v-card-title.headline New Widget
    v-card-text
      v-text-field(
        v-model="label"
        :disabled="isLoading"
        placeholder="Label"
        autofocus
      )
    v-card-actions
      v-spacer
      v-btn(
        :disabled="!value"
        :loading="isLoading"
        @click="submit"
        flat
      ) Save
</template>

<script>
import { mapState, mapActions } from 'vuex'
import ProxyValue from '@/mixins/proxyValue'

export default {
  name: 'NewIntegration',
  mixins: [ ProxyValue ], // Possible dialog mixin
  data: () => ({
    label: undefined
  }),
  computed: mapState('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    // ...mapActions('Widget', ['create']),
    async submit () {
      this.setIsLoading(true)
      try {
        // this.create()
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
