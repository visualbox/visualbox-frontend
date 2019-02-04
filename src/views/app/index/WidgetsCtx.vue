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
  .pa-2(v-if="showSearch")
    v-text-field.search(
      @input="search"
      :loading="loadingSearch"
      label="Search widgets"
      solo flat
      single-line autofocus
      hide-details
    )
  .text-xs-center(v-if="showSearch && showNoHitsSearch")
    v-icon.mb-3.mt-3 mdi-package-variant
    .caption No results. Try a different phrase.
  v-list(
    v-if="showSearch"
    dense
  )
    v-list-tile(
      v-for="(item, index) in listSearch"
      :key="index"
      :to="`/app/w/${item.objectID}/public`"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ name(item) }}

  //- List
  v-list(
    v-if="!showSearch"
    dense
  )
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      @mouseover="hoverIndex = index"
      @mouseout="hoverIndex = null"
      @click="$router.push(`/app/w/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ name(item) }}
      v-list-tile-action(v-if="index === hoverIndex")
        tooltip(text="Delete" :open-delay="800" bottom)
          v-icon(@click.stop="deleteWidget(item.id)" small) mdi-trash-can-outline
</template>

<script>
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'
import Auth from '@aws-amplify/auth'
import { mapState, mapActions } from 'vuex'
import { widgetsIndex } from '@/lib/algoliasearch'
import { packageJson } from '@/lib/utils/projectUtils'
import { ContextToolbar, Tooltip } from '@/components'

export default {
  name: 'WidgetsCtx',
  components: {
    ContextToolbar,
    Tooltip
  },
  data: () => ({
    showSearch: false,
    loadingSearch: false,
    listSearch: [],
    showNoHitsSearch: false,
    hoverIndex: null,
    identityId: null
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
    search: debounce(function (query) {
      if (!query || query === '')
        return

      this.loadingSearch = true
      this.showNoHitsSearch = false

      widgetsIndex.search({
        query,
        attributesToRetrieve: ['objectID', 'package', 'readme', 'updatedAt']
        // filters: `-uid:'${this.identityId}'`
      }, (err, result) => {
        this.loadingSearch = false

        if (err) {
          this.showNoHitsSearch = true
          return
        }

        if (result.hits.length <= 0)
          this.showNoHitsSearch = true
        this.listSearch = result.hits
      })
    }, process.env.VUE_APP_SEARCH_DEBOUNCE),
    name (item) {
      return packageJson(item, 'name', 'Untitled')
    }
  },
  async mounted () {
    const { identityId } = await Auth.currentCredentials()
    this.identityId = identityId
  }
}
</script>
