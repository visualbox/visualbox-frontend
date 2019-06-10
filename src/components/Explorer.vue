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

    v-flex.mt-3(xs12)

      //- Registry / local tabs
      template(v-if="!selected")
        v-btn.ma-0.mr-4.pl-2(
          @click="local = false"
          :text="local"
          :disabled="!local"
        )
          v-icon.mr-2 mdi-earth
          | Registry
        v-btn.ma-0.pl-2(
          v-if="showLocal"
          @click="local = true"
          :text="!local"
          :disabled="local"
        )
          v-icon.mr-2 mdi-home
          | Local
      
      //- Selected back/add button
      template(v-else)
        v-btn.ma-0.mr-4.pl-2(
          @click="selected = null"
          text
        )
          v-icon.mr-2 mdi-menu-left
          | Back
        v-select.d-inline-flex.mr-4.select(
          v-if="!local && showLocal"
          v-model="selectedVersion"
          :items="selected.versions"
          hide-details solo
        )
        //- Only show 'Add' is local is shown,
        //- meaning that the explorer is in a dashboard
        v-btn.ma-0.pl-2(
          v-if="showLocal"
          @click="add(selected)"
          :loading="loading"
          :disabled="loading"
          color="primary"
        )
          v-icon.mr-2 mdi-plus
          | Add
        //- Else show a 'Fork' button
        v-btn.ma-0.pl-2(
          v-if="!showLocal"
          @click="fork(selected)"
          :loading="loading"
          :disabled="loading"
          color="primary"
        )
          v-icon.mr-2 mdi-silverware-fork
          | Fork Code

    //- Search result contents
    v-container.pa-0.pt-4(
      v-if="search"
      fluid grid-list-xl
    )
      v-layout(row wrap)
        v-flex(xs12)
          .headline.font-weight-light Search

    //- Browser
    template(v-else-if="!search && !selected")
      v-container.pa-0.pt-4(fluid grid-list-xl)
        v-layout(row wrap)
          v-flex(xs12)
            .headline.font-weight-light {{ local ? 'Local' : 'Popular' }}
          v-flex(
            v-for="(item, index) in currentList"
            :key="index"
            @click="selected = item"
            v-bind="cols"
          )
            v-responsive(:aspect-ratio="1")
              v-card(flat)
                v-img(
                  :src="item.settings.thumb || require('../assets/img/vbox-default-thumb.png')"
                  height="40%"
                )
                .content
                  v-btn(color="primary") View
                  v-card-title.subtitle-1.font-weight-medium {{ item.settings.name }}
                  v-card-text {{ item.intro }}

    //- Selected
    template(v-else-if="!search && selected")
      v-container(fluid).pa-0.pt-4
        .markdown(v-html="selected.readme")
</template>

<script>
import get from 'lodash-es/get'
import marked from 'marked'
import { mapState, mapActions } from 'vuex'
import { integrationsIndex, widgetsIndex } from '@/lib/algoliasearch'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'

export default {
  name: 'Explorer',
  props: ['config'],
  data: () => ({
    // Explorer title
    title: null,
    // Search input placeholder
    placeholder: null,
    // If 'Local' tab should be visible
    showLocal: true,

    // If explorer is currently viewing local
    local: false,
    // Search input string
    search: null,
    // Currently selected item
    selected: null,
    // Selected item version
    selectedVersion: '*',
    // Loading state (adding item)
    loading: false,

    // Algoliasearch index in use
    index: null,
    // Algoliasearch result array
    browsePopular: [],

    // Responsive stuff
    resizeSensor: null,
    cols: { xs12: true }
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
        const readme = marked(item.readme, {
          sanitize: true,
          gfm: true,
          silent: true
        })

        // Strip HTML
        const doc = new DOMParser().parseFromString(readme, 'text/html')
        const intro = doc.body.textContent || ''

        const versions = Object.keys(item.versions).map(k => ({ text: k, value: k }))
        versions.unshift({
          text: 'Latest',
          value: '*'
        })

        return {
          id: item.id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          uid: item.uid,
          readme,
          intro,
          settings: item.settings,
          versions
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
        this.selected = null

        this.browse()
      }
    },
    selected () {
      this.selectedVersion = '*'
    },
    search () {
      this.selected = null
    }
  },
  methods: {
    ...mapActions('Dashboard', [
      'closeExplorer',
      'addIntegration',
      'addWidget'
    ]),
    async add ({ id }) {
      try {
        this.loading = true
        const version = this.local
          ? '^'
          : this.selectedVersion || '*'

        if (this.config.type === 'INTEGRATION')
          await this.addIntegration({ id, version })
        else
          await this.addWidget({ id, version })

        this.closeExplorer()
      } catch (e) {
        console.log('Failed to add', e)
      } finally {
        this.loading = false
      }
    },
    async fork ({ id }) {
      try {
        this.loading = true

        if (this.config.type === 'INTEGRATION')
          await this.$store.dispatch('Integration/create', { id })
        else
          await this.$store.dispatch('Widget/create', { id })
      } catch (e) {
        console.log('Failed to fork', e)
      } finally {
        this.loading = false
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
          const readme = marked(hit.readme, {
            sanitize: true,
            gfm: true,
            silent: true
          })

          // Strip HTML
          const doc = new DOMParser().parseFromString(readme, 'text/html')
          const intro = doc.body.textContent || ''

          const versions = Object.keys(hit.versions).map(k => ({ text: k, value: k }))
          versions.unshift({
            text: 'Latest',
            value: '*'
          })

          return {
            id: hit.objectID,
            createdAt: hit.createdAt,
            updatedAt: hit.updatedAt,
            uid: hit.uid,
            readme,
            intro,
            settings: hit.settings,
            versions
          }
        })
      })
    },

    /**
     * Use custom resize watcher since Vuetify
     * won't detect element resize (only window).
     */
    onResize ({ width }) {
      const { xs, sm, md, lg } = this.$vuetify.breakpoint.thresholds
      let cols = 12

      if (width >= lg)
        cols = 2
      else if (width >= md)
        cols = 3
      else if (width >= sm)
        cols = 4
      else if (width >= xs)
        cols = 6

      this.cols = { [`xs${cols}`]: true }
    }
  },
  mounted () {
    this.resizeSensor = new ResizeSensor(this.$el, this.onResize)
  },
  beforeDestroy () {
    this.resizeSensor.detach()
  }
}
</script>

<style lang="stylus" scoped>
@import '../assets/styles/colors';

#explorer
  width 100%
  height 100%
  min-height 100%

  // Needed to access responsive content
  >>> .v-responsive__content
    &:hover
      .v-card
        .v-image
          -webkit-transform scale(1.0235) translateZ(0)
          -ms-transform scale(1.0235) translateZ(0)
          -moz-transform scale(1.0235) translateZ(0)
          transform scale(1.0235) translateZ(0)

        .content
          .v-btn
            opacity 1

    .v-card
      position absolute
      top 0; bottom 0; left 0; right 0;
      background-color $vb-drawer-mini
      overflow hidden
      border-radius 10px
      cursor pointer

      -webkit-transition all 125ms ease-in
      -ms-transition all 125ms ease-in
      -moz-transition all 125ms ease-in
      transition all 125ms ease-in

      .v-image
        height 40%

        -webkit-transition all 125ms ease-in
        -ms-transition all 125ms ease-in
        -moz-transition all 125ms ease-in
        transition all 125ms ease-in

        &:before
          content ''
          height 50%
          position absolute
          bottom 0; left 0; right 0;
          background-image linear-gradient(transparent, $vb-drawer-mini)

      .content
        height 60%
        position relative

        .v-btn
          position absolute
          top -52px; right 16px;
          opacity 0

        .subtitle-1
          padding 8px 16px
          white-space nowrap
          text-overflow ellipsis
          overflow hidden
          display block

        .v-card__text
          position absolute
          top 44px; bottom 0; left 0; right 0;
          overflow hidden

          &:before
            content ''
            height 50px
            position absolute
            bottom 0; left 0; right 0;
            background-image linear-gradient(transparent, $vb-drawer-mini)
</style>
