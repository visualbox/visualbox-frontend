<template lang="pug">
#integrations
  app-context-toolbar
    .subheading Integrations
    v-spacer
    v-btn(icon)
      v-icon mdi-magnify
    v-btn(icon)
      v-icon mdi-plus-box
  .pa-2
    v-text-field.search(
      clearable solo flat
      single-line autofocus
      label="Search integrations"
      :loading="false"
    )
</template>

<script>
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'Integrations',
  components: { AppContextToolbar }
}
</script>

<style lang="stylus" scoped>
</style>
