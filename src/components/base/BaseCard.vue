<template lang="pug">
v-card(dark)
  v-progress-linear.loading(
    value="100"
    height="2"
    color="primary"
    :indeterminate="loading"
    v-if="loading"
  )
  slot
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BaseCard',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<style lang="stylus" scoped>
.v-card
  .loading
    margin 0
</style>
