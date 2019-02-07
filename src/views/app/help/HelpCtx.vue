<template lang="pug">
#help-ctx
  context-toolbar
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

<script lang="ts">
import Vue from 'vue'
import { ContextToolbar } from '@/components'

export default Vue.extend({
  name: 'HelpCtx',
  components: { ContextToolbar },
  data: () => ({
    list: [
      { label: 'Home', icon: 'mdi-home', to: '/app/h' },
      { label: 'Integrations', icon: 'mdi-source-fork', to: '/app/h/integrations' },
      { label: 'Widgets', icon: 'mdi-hexagon-multiple', to: '/app/h/widgets' },
      { label: 'Configuration Types', icon: 'mdi-json', to: '/app/h/config-types' }
    ]
  })
})
</script>
