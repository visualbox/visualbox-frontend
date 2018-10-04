<template lang="pug">
#widgets
  new-widget(v-model="showDialog")

  app-context-toolbar
    .subheading Widgets
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
      label="Search widgets"
      :loading="false"
    )

  //- List
  v-list(v-if="!showSearch")
    v-list-tile
      v-list-tile-title Foo
</template>

<script>
import AppContextToolbar from '@/components/app/AppContextToolbar'
import NewWidget from '@/components/dialog/NewWidget'

export default {
  name: 'Widgets',
  components: {
    AppContextToolbar,
    NewWidget
  },
  data: () => ({
    showDialog: false,
    showSearch: false
  })
}
</script>

<style lang="stylus" scoped>
#widgets
  .v-list
    padding 0
</style>
