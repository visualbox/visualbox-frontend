<template lang="pug">
#widget-ctx(v-if="loaded")
  search-dependencies(:show.sync="dialog")
  context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ name }}

  v-list.editor-list(dense)
    //- Files
    v-list-tile.no-hover(@click="open.files = !open.files")
      v-list-tile-action
        v-icon {{ open.files ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Files
    v-list-tile(
      v-if="open.files"
      v-for="(item, index) in listFiles"
      :key="index"
      @click="WIDGET_SET_TAB(item.tab)"
      :class="{ 'active' : tab === item.tab }"
    )
      v-list-tile-action
        v-icon(
          :color="FILE_TYPES[item.file].color"
          small
        ) {{ FILE_TYPES[item.file].icon }}
      v-list-tile-content {{ item.text }}

    //- Settings
    v-list-tile.no-hover(@click="open.settings = !open.settings")
      v-list-tile-action
        v-icon {{ open.settings ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Settings
    v-container.pt-2(
      v-if="open.settings"
      grid-list-lg
    )
      v-layout(row wrap)
        v-flex(xs12)
          v-text-field(
            v-model="name"
            label="Name"
            hide-details
            outline
          )
        v-flex(xs10)
          v-switch.ma-0(
            v-model="public"
            label="Public"
            color="primary"
            hide-details
          )

    //- Dependencies
    v-list-tile.no-hover(@click="open.dependencies = !open.dependencies")
      v-list-tile-action
        v-icon {{ open.dependencies ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Dependencies
    v-list-tile(
      v-if="open.dependencies"
      v-for="(item, index) in dependencies"
      :key="'d' + index"
      @mouseover="hoverIndex = index"
      @mouseout="hoverIndex = null"
      @click=""
    )
      v-list-tile-action
        v-icon(small color="blue") mdi-package-variant-closed
      v-list-tile-content {{ item.package }}@{{ item.version }}
      v-list-tile-action(v-if="index === hoverIndex")
        v-btn(
          flat icon
          @click.stop=""
        )
          v-icon(small) mdi-trash-can-outline
    v-btn.ma-0(
      v-if="open.dependencies"
      flat block large
      color="primary"
      @click="dialog = true"
    ) Add Dependency
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions } from 'vuex'
import { ContextToolbar } from '@/components'
import { SearchDependencies } from '@/components/dialog'
import { cloneDeep } from '@/lib/utils'
import FILE_TYPES from '@/lib/fileTypes'

export default {
  name: 'WidgetCtx',
  components: {
    ContextToolbar,
    SearchDependencies
  },
  data: () => ({
    hoverIndex: null,
    dialog: false,
    FILE_TYPES,
    open: {
      files: true,
      dependencies: false,
      settings: false
    },
    listFiles: [
      { text: 'config.json', file: 'json', tab: 1 },
      { text: 'index.html', file: 'html', tab: 2 },
      { text: 'package.json', file: 'json', tab: 3 },
      { text: 'README.md', file: 'md', tab: 4 }
    ]
  }),
  methods: {
    ...mapActions('Widget', ['updateLoaded']),
    ...mapActions('App', ['setSnackbar']),
    ...mapMutations('Widget', ['WIDGET_SET_TAB'])
  },
  computed: {
    ...mapState('Widget', ['loaded', 'tab']),
    name: {
      get () {
        return _.get(this, 'loaded.package.name', '')
      },
      set (name) {
        let pkg = cloneDeep(_.get(this, 'loaded.package', {}))
        pkg.name = name
        this.updateLoaded({ package: pkg })
      }
    },
    public: {
      get () {
        return _.get(this, 'loaded.package.public', false)
      },
      set (isPublic) {
        let pkg = cloneDeep(_.get(this, 'loaded.package', {}))
        pkg.public = isPublic
        this.updateLoaded({ package: pkg })
      }
    },
    dependencies () {
      const list = _.get(this, 'loaded.package.dependencies', {})
      return Object.keys(list).reduce((a, b) => {
        a.push({
          package: b,
          version: list[b]
        })
        return a
      }, [])
    }
  }
}
</script>
