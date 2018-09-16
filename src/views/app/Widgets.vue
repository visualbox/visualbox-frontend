<template lang="pug">
#widgets
  app-context-toolbar
    .subheading Widgets
    v-spacer
  .pa-2
    v-text-field.search(
      clearable solo flat
      single-line autofocus
      label="Search widgets"
      :loading="false"
    )
</template>

<script>
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'Widgets',
  components: { AppContextToolbar }
}
</script>

<style lang="stylus" scoped>
</style>
