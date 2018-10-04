<template lang="pug">
v-dialog(
  v-model="internalValue"
  max-width="500"
  scrollable
)
  base-card(:loading="isLoading")
    v-card-title.headline New Integration
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
import { mapActions, mapGetters } from 'vuex'
import ProxyValue from '@/mixins/proxyValue'

export default {
  name: 'NewIntegration',
  mixins: [ ProxyValue ], // Possible dialog mixin
  data: () => ({
    label: undefined
  }),
  computed: mapGetters('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    // ...mapActions('Integration', ['create']),
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
