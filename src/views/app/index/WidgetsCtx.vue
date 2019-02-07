<template lang="pug">
#widgets-ctx
  context-toolbar
    .subheading Manage Widgets
    v-spacer
    v-btn(
      icon
      @click="showSearch = !showSearch"
    )
      v-icon(v-if="!showSearch") mdi-magnify
      v-icon(v-if="showSearch") mdi-close
    v-btn(
      icon
      @click="submit"
      :loading="isLoading"
      :disabled="isLoading"
    )
      v-icon mdi-plus-box

  //- Search
  algolia-search(
    v-if="showSearch"
    type="widget"
  )

  //- List
  v-list.hover-actions(
    v-if="!showSearch"
    dense
  )
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      @click="$router.push(`/app/w/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ name(item) }}
      v-list-tile-action
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="deleteWidget(item.id)" small) mdi-trash-can-outline
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { packageJson } from '@/lib/utils/projectUtils'
import { ContextToolbar, Tooltip, AlgoliaSearch } from '@/components'

export default {
  name: 'WidgetsCtx',
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
    ...mapState('Widget', ['list'])
  },
  watch: {
    list () {
      this.showSearch = false
    }
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Widget', ['create', 'del']),
    deleteWidget (id) {
      if (confirm('Are you sure you want to delete the widget?'))
        this.del(id)
    },
    async submit () {
      this.showSearch = false
      this.setIsLoading(true)
      try {
        await this.create()
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
      }
    },
    name (item) {
      return packageJson(item, 'name', 'Untitled')
    }
  }
}
</script>
