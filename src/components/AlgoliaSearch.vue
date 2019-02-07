<template lang="pug">
#algolia-search
  .pa-2
    v-text-field(
      @input="search"
      :loading="loading"
      :label="`Search ${phrase}`"
      solo flat
      single-line autofocus
      hide-details
    )
  .text-xs-center(v-if="noHits")
    v-icon.mb-3.mt-3 mdi-package-variant
    .caption No results. Try a different phrase.
  v-list(dense)
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
      :to="`/app/${urlPath}/${item.objectID}/public`"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ name(item) }}
</template>

<script>
import Auth from '@aws-amplify/auth'
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'
import { packageJson } from '@/lib/utils/projectUtils'
import { integrationsIndex, widgetsIndex } from '@/lib/algoliasearch'

export default {
  name: 'AlgoliaSearch',
  props: ['type'],
  data: () => ({
    loading: false,
    noHits: false,
    list: [],
    identityId: null,

    urlPath: null,
    phrase: null,
    index: null
  }),
  methods: {
    search: debounce(function (query) {
      if (!query || query === '')
        return

      this.loading = true
      this.noHits = false

      this.index.search({
        query,
        attributesToRetrieve: ['objectID', 'package', 'readme', 'updatedAt'],
        facetFilters: `uid:-'${this.identityId}'`
      }, (err, result) => {
        this.loading = false

        if (err) {
          this.noHits = true
          return
        }

        if (result.hits.length <= 0)
          this.noHits = true
        this.list = result.hits
      })
    }, process.env.VUE_APP_SEARCH_DEBOUNCE),
    name (item) {
      return get(item, 'package.name', 'Untitled')
    }
  },
  async mounted () {
    const { identityId } = await Auth.currentCredentials()
    this.identityId = identityId

    if (this.type === 'widget') {
      this.urlPath = 'i'
      this.phrase = 'widgets'
      this.index = widgetsIndex
    } else {
      this.urlPath = 'i'
      this.phrase = 'integrations'
      this.index = integrationsIndex
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
