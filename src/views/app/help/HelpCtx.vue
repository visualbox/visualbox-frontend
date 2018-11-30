<template lang="pug">
#help-ctx
  app-context-toolbar
    .subheading Help Center

  //- List
  v-list
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      :to="item.to"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
</template>

<script>
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'HelpCtx',
  components: { AppContextToolbar },
  data: () => ({
    list: [
      { label: 'Index', to: 'h/' },
      { label: 'Widgets', to: 'h/widgets' }
    ]
  })
}
</script>

<style lang="stylus" scoped>
#help-ctx
  .v-list
    padding 0
</style>
