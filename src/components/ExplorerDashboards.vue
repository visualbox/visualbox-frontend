<template lang="pug">
v-list(dense subheader)
  v-subheader New Public Dashboards
  v-list-item-group
    v-list-item(
      v-for="(item, index) in list"
      :key="index"
      :href="getPublicURL(item.objectID)"
      target="_blank"
    )
      v-list-item-icon
        v-img(
          :src="require('../assets/img/vbox-white.svg')"
          width="25"
        )
      v-list-item-content
        v-list-item-title(v-text="item.label")
        v-list-item-subtitle(v-html="getUpdatedAt(item.updatedAt)")
</template>

<script>
import { dashboardsIndex } from '@/lib/algoliasearch'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default {
  name: 'ExplorerDashboards',
  data: () => ({
    list: []
  }),
  methods: {
    browse () {
      dashboardsIndex.search({
        query: '',
        // facetFilters: `uid:-'${this.identityId}'`
      }, (err, result) => {
        if (err)
          return
        this.list = result.hits.sort((a, b) => {
          if (a.updatedAt < b.updatedAt)
            return 1
          if (a.updatedAt > b.updatedAt)
            return -1
          return 0
        })
      })
    },
    getPublicURL (id) {
      return `${window.location.origin}/public/${id}`
    },
    getUpdatedAt (updatedAt) {
      const a = new Date(updatedAt)
      return `Updated at &mdash; ${a.getDate()} ${MONTHS[a.getMonth()]}, ${a.getHours()}:${a.getMinutes()}`
    }
  },
  mounted () {
    this.browse()
  }
}
</script>

<style lang="stylus" scoped>
</style>
