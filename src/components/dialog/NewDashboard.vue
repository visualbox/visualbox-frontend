<template lang="pug">
v-dialog(
  v-model="internalValue"
  max-width="500"
  scrollable
)
  base-card(:loading="loading")
    v-card-title.headline New Dashboard
    v-card-text
      v-text-field(
        v-model="label"
        :disabled="loading"
        placeholder="Label"
        autofocus
      )
    v-card-actions
      v-spacer
      v-btn(
        :disabled="!value"
        :loading="loading"
        @click=""
        flat
      ) Save
</template>

<script>
import ProxyValue from '@/mixins/proxyValue'

export default {
  name: 'NewDashboard',
  mixins: [ ProxyValue ],
  data: () => ({
    label: undefined,
    loading: false
  })
}
</script>

<style lang="stylus" scoped>
</style>
