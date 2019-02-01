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
      label="Search integrations"
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
      :to="`/app/i/${item.objectID}/public`"
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
      @click="$router.push(`/app/i/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ name(item) }}
      v-list-tile-action(v-if="index === hoverIndex")
        v-btn(
          flat icon
          @click.stop="del(item.id)"
        )
          v-icon(small) mdi-trash-can-outline
</template>

<script>
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'
import Auth from '@aws-amplify/auth'
import { mapState, mapActions } from 'vuex'
import { integrationsIndex } from '@/lib/algoliasearch'
import { ContextToolbar } from '@/components'

export default {
  name: 'IntegrationsCtx',
  components: { ContextToolbar },
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
    ...mapState('Integration', ['list'])
  },
  watch: {
    list () {
      this.showSearch = false
    }
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Integration', ['create', 'del']),
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

      integrationsIndex.search({
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
      return get(item, 'package.name', 'Untitled')
    }
  },
  async mounted () {
    const { identityId } = await Auth.currentCredentials()
    this.identityId = identityId
  }
}
</script>
