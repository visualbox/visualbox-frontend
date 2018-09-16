<template lang="pug">
#integrations
  .pa-2
    v-text-field.search(
      clearable solo flat
      single-line autofocus
      label="Search integrations"
      :loading="false"
    )
</template>

<script>
export default {
  name: 'Integrations'
}
</script>

<style lang="stylus" scoped>
</style>
