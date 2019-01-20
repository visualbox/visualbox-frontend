<template lang="pug">
#help-ctx
  app-context-toolbar
    .subheading Help Center

  //- List
  v-list(dense)
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      :to="item.to"
      exact
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
      v-list-tile-action
        v-icon {{ item.icon }}
</template>

<script>
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'HelpCtx',
  components: { AppContextToolbar },
  data: () => ({
    list: [
      { label: 'Home', icon: 'mdi-home', to: '/app/h' },
      { label: 'Integrations', icon: 'mdi-source-fork', to: '/app/h/integrations' },
      { label: 'Widgets', icon: 'mdi-hexagon-multiple', to: '/app/h/widgets' },
      { label: 'Configuration Types', icon: 'mdi-json', to: '/app/h/config-types' }
    ]
  })
}
</script>
