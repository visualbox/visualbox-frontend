<template lang="pug">
#integrations-ctx
  app-context-toolbar
    .subheading Integrations
    v-spacer
    v-btn(
      icon
      @click="showSearch = !showSearch"
    )
      v-icon(v-if="!showSearch") mdi-magnify
      v-icon(v-if="showSearch") mdi-close
    v-btn(
      icon
      @click="showDialog = true"
    )
      v-icon mdi-plus-box

  //- Search
  .pa-2(v-if="showSearch")
    v-text-field.search(
      clearable solo flat
      single-line autofocus
      label="Search integrations"
      :loading="false"
    )

  //- List
  v-list(v-if="!showSearch")
    v-list-tile
      v-list-tile-title Foo
</template>

<script>
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'IntegrationsCtx',
  components: { AppContextToolbar },
  data: () => ({
    showSearch: false
  })
}
</script>

<style lang="stylus" scoped>
#integrations-ctx
  .v-list
    padding 0
</style>
