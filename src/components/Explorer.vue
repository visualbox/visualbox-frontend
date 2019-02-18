<template lang="pug">
v-container#explorer(fluid)
  v-layout(row wrap)

    //- Title and search
    v-flex(xs7)
      .display-1.font-weight-light {{ title }}
    v-flex(xs5)
      v-text-field(
        v-model="search"
        :placeholder="placeholder"
        prepend-inner-icon="mdi-magnify"
        single-line clearable
        solo hide-details
      )

    //- Registry / local tabs
    v-flex.mt-3(xs12)
      v-btn.ma-0.mr-4.pl-2(
        @click="local = false"
        :flat="local"
        :disabled="!local"
      )
        v-icon.mr-2 mdi-earth
        | Registry
      v-btn.ma-0.pl-2(
        v-if="showLocal"
        @click="local = true"
        :flat="!local"
        :disabled="local"
      )
        v-icon.mr-2 mdi-home
        | Local

    //- Search result contents
    v-container.pa-0.pt-4(
      v-if="search"
      fluid grid-list-xl
    )
      v-layout(row wrap)
        v-flex(xs12)
          .headline.font-weight-light Search

    //- Browser
    template(v-if="!search")
      //- Local
      v-container.pa-0.pt-4(
        v-if="local"
        fluid grid-list-xl
      )
        v-layout(row wrap)
          v-flex(xs12)
            .headline.font-weight-light Local
          v-flex(
            v-for="(item, index) in list"
            :key="index"
            @click="selected = item"
            xs4
          )
            v-card
              v-card-title
                .title.font-weight-light {{ item.settings.name }}
              v-card-text {{ item.readme }}

      //- Registry
      v-container.pa-0.pt-4(
        v-if="!local"
        fluid grid-list-xl
      )
        v-layout(row wrap)
          v-flex(xs12)
            .headline.font-weight-light Popular
          v-flex(
            v-for="(item, index) in browsePopular"
            :key="index"
            @click="selected = item"
            xs4
          )
            v-card
              v-card-title
                .title.font-weight-light {{ item.settings.name }}
              v-card-text {{ item.readme }}
              v-card-actions
                v-spacer
                v-btn(
                  @click="add(item)"
                  flat small
                ) Add
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { integrationsIndex, widgetsIndex } from '@/lib/algoliasearch'

export default {
  name: 'Explorer',
  props: ['config'],
  data: () => ({
    title: null,
    placeholder: null,
    showLocal: true,

    local: false,
    search: null,
    selected: null,

    index: null,
    browsePopular: []
  }),
  computed: mapState('Integration', ['list']),
  watch: {
    config: {
      deep: true,
      immediate: true,
      handler ({ type, local, show }) {
        if (type === 'INTEGRATION') {
          this.title = 'Integrations'
          this.placeholder = 'Search integrations...'
          this.index = integrationsIndex
        } else {
          this.title = 'Widgets'
          this.placeholder = 'Search widgets...'
          this.index = widgetsIndex
        }

        this.showLocal = !!local
        this.local = false

        this.browse()
      }
    }
  },
  methods: {
    ...mapActions('Dashboard', [
      'addIntegration',
      'addWidget'
    ]),
    add (item) {
      if (this.config.type === 'INTEGRATION')
        this.addIntegration(item)
      else
        this.addWidget(item)
    },
    browse () {
      this.index.search({
        query: '',
        // facetFilters: `uid:-'${this.identityId}'`
      }, (err, result) => {
        if (err)
          return
        this.browsePopular = result.hits.map(hit => {
          return {
            id: hit.objectID,
            createdAt: hit.createdAt,
            updatedAt: hit.updatedAt,
            uid: hit.uid,
            readme: hit.readme,
            settings: hit.settings,
            versions: Object.keys(hit.versions).reduce((a, b) => {
              a.push({
                n: b,
                versionId: hit.versions[b]
              })
              return a
            }, [])
          }
        })
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
#explorer
  width 100%
  height 100%
  min-height 100%

  .v-card
    height 250px
    overflow hidden

    .v-card__title
      padding-bottom 0

    .v-card__text
      max-height 145px
      overflow hidden
</style>
