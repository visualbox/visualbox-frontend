<template lang="pug">
v-container#explorer(fluid)
  v-layout(row wrap)

    //- Title and search
    v-flex(xs7)
      .display-1.font-weight-light Add {{ title }}
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
      v-container.pa-0.pt-4(fluid grid-list-xl)
        v-layout(row wrap)
          v-flex(xs12)
            .headline.font-weight-light {{ local ? 'Local' : 'Popular' }}
          v-flex(
            v-for="(item, index) in currentList"
            :key="index"
            @click="selected = item"
            xs12 sm6 md4 lg3 xl2
          )
            v-card
              v-responsive(:aspect-ratio="1/1")
                .background
                .text
                  .headline {{ item.settings.name }}
                  .subheading {{ item.intro }}
</template>

<script>
import get from 'lodash-es/get'
import marked from 'marked'
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
  computed: {
    ...mapState({
      listIntegration: state => state.Integration.list,
      listWidget: state => state.Widget.list
    }),
    browseLocal () {
      const list = this.config.type === 'INTEGRATION'
        ? this.listIntegration
        : this.listWidget

      return list.map(item => {
        const readme = get(item, ['files', 'README.md', 'contents'], '')

        let intro = marked(readme, {
          sanitize: true,
          gfm: true,
          silent: true
        })

        // Strip HTML
        const doc = new DOMParser().parseFromString(intro, 'text/html')
        intro = doc.body.textContent || ''

        return {
          id: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          uid: item.uid,
          readme,
          intro,
          settings: item.settings,
          versions: Object.keys(item.versions).reduce((a, b) => {
            a.push({
              n: b,
              versionId: item.versions[b]
            })
            return a
          }, [])
        }
      })
    },
    currentList () {
      return this.local ? this.browseLocal : this.browsePopular
    }
  },
  watch: {
    config: {
      deep: true,
      immediate: true,
      handler ({ type, local, show }) {
        if (type === 'INTEGRATION') {
          this.title = 'Integration'
          this.placeholder = 'Search integrations...'
          this.index = integrationsIndex
        } else {
          this.title = 'Widget'
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
      'closeExplorer',
      'addIntegration',
      'addWidget'
    ]),
    async add (item) {
      try {
        if (this.config.type === 'INTEGRATION')
          this.addIntegration(item)
        else {
          await this.addWidget(item)
          this.closeExplorer()
        }
      } catch (e) {
        console.log('Failed to add', e)
      }
    },
    browse () {
      this.index.search({
        query: '',
        // facetFilters: `uid:-'${this.identityId}'`
      }, (err, result) => {
        if (err)
          return
        this.browsePopular = result.hits.map(hit => {
          let intro = marked(hit.readme, {
            sanitize: true,
            gfm: true,
            silent: true
          })

          // Strip HTML
          const doc = new DOMParser().parseFromString(intro, 'text/html')
          intro = doc.body.textContent || ''

          return {
            id: hit.objectID,
            createdAt: hit.createdAt,
            updatedAt: hit.updatedAt,
            uid: hit.uid,
            readme: hit.readme,
            intro,
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
    overflow hidden

    &:hover
      z-index 2
      cursor pointer
      -webkit-transition all 50ms ease-in
      -webkit-transform scale(1.015)
      -ms-transition all 50ms ease-in
      -ms-transform scale(1.015)
      -moz-transition all 50ms ease-in
      -moz-transform scale(1.015)
      transition all 50ms ease-in
      transform scale(1.015)

    >>> .v-responsive__content
      display flex
      flex-direction column
      justify-content center

      .background
        position absolute
        top 0; left 0; right 0; bottom 0;
        background-image url(https://www.itromso.no/nyhet/article14207016.ece/90iuwu/ALTERNATES/w980-default/1025580.jpg)
        background-size cover
        filter brightness(0.4)
      
      .text
        position absolute
        padding 10px
        z-index 1

        .headline
          font-weight 300
          white-space nowrap

        .subheading
          font-weight 300
</style>
