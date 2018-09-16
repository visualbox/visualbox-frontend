<template lang="pug">
#widgets
  .pa-2
    v-text-field.search(
      clearable solo flat
      single-line autofocus
      label="Search widgets"
      :loading="false"
    )
</template>

<script>
export default {
  name: 'Widgets'
}
</script>

<style lang="stylus" scoped>
</style>
