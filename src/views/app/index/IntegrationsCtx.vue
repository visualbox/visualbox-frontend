<template lang="pug">
#integrations-ctx
  context-toolbar
    .subheading Manage Integrations
    v-spacer
    v-btn(
      icon
      @click="showSearch = !showSearch"
    )
      v-icon(v-if="!showSearch") mdi-magnify
      v-icon(v-if="showSearch") mdi-close
    v-btn(
      icon
      @click="addIntegration"
      :loading="isLoading"
      :disabled="isLoading"
    )
      v-icon mdi-plus-box

  //- Search
  algolia-search(
    v-if="showSearch"
    type="integration"
  )

  //- List
  v-list.hover-actions(
    v-if="!showSearch"
    dense
  )
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      @click="$router.push(`/app/i/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ name(item) }}
      v-list-tile-action
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="deleteIntegration(item.id)" small) mdi-trash-can-outline
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { packageJson } from '@/lib/utils/projectUtils'
import { ContextToolbar, Tooltip, AlgoliaSearch } from '@/components'
import EventBus from '@/lib/eventBus'

export default {
  name: 'IntegrationsCtx',
  components: {
    ContextToolbar,
    Tooltip,
    AlgoliaSearch
  },
  data: () => ({
    showSearch: false
  }),
  computed: {
    ...mapState('App', ['isLoading']),
    ...mapState('Integration', ['list'])
  },
  watch: {
    list () {
      this.showSearch = false
    }
  },
  methods: {
    ...mapActions('Integration', ['del']),
    addIntegration () {
      EventBus.$emit('vbox:addIntegration')
    },
    deleteIntegration (id) {
      if (confirm('Are you sure you want to delete the integration?'))
        this.del(id)
    },
    name (item) {
      return packageJson(item, 'name', 'Untitled')
    }
  }
}
</script>
