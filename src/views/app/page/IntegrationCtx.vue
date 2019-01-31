<template lang="pug">
#integration-ctx(v-if="loaded")
  context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ name }}

  v-list.editor-list(dense)
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
            hide-details outline
          )
        v-flex(xs10)
          v-switch.ma-0(
            v-model="public"
            label="Public"
            color="primary"
            hide-details
          )

    //- Files
    v-list-tile.no-hover(@click="open.files = !open.files")
      v-list-tile-action
        v-icon {{ open.files ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Files
    v-list-tile(
      v-if="open.files"
      v-for="(item, index) in listFiles"
      :key="index"
      @click="INTEGRATION_SET_TAB(item.tab)"
      :class="{ 'active' : tab === item.tab }"
    )
      v-list-tile-action
        v-icon(
          :color="FILE_TYPES[item.file].color"
          small
        ) {{ FILE_TYPES[item.file].icon }}
      v-list-tile-content {{ item.text }}

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
      v-list-tile-content
        a(
          :href="'https://www.npmjs.com/package/' + item.name"
          target="_new"
        ) {{ item.name }}
      v-list-tile-action
        v-btn(
          v-if="index === hoverIndex"
          @click.stop="removeDependency(item.name)"
          flat icon
        )
          v-icon(small) mdi-trash-can-outline
        .grey--text.pr-2(v-else) {{ item.version }}
    v-container.pt-2(v-if="open.dependencies")
      v-text-field.dependency-input(
        v-model="dependency"
        @keyup.enter.native="addDependency"
        :loading="dependencyLoading"
        :disabled="dependencyLoading"
        placeholder="Enter package name"
        hide-details outline single-line
      )
      pre {{ resDependencies }}
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions } from 'vuex'
import { ContextToolbar } from '@/components'
import FILE_TYPES from '@/lib/fileTypes'
import cloneDeep from '@/lib/cloneDeep'

export default {
  name: 'IntegrationCtx',
  components: { ContextToolbar },
  data: () => ({
    hoverIndex: null,
    dependency: '',
    dependencyLoading: false,
    FILE_TYPES,
    open: {
      files: true,
      dependencies: false,
      settings: false
    },
    listFiles: [
      { text: 'config.json', file: 'json', tab: 1 },
      { text: 'index.js', file: 'js', tab: 2 },
      { text: 'package.json', file: 'json', tab: 3 },
      { text: 'README.md', file: 'md', tab: 4 }
    ]
  }),
  methods: {
    ...mapActions('Integration', ['updateLoaded', 'resolveDependency']),
    ...mapActions('App', ['setSnackbar']),
    ...mapMutations('Integration', ['INTEGRATION_SET_TAB']),
    async addDependency () {
      this.dependencyLoading = true
      const dependency = this.dependency
      this.dependency = ''
      try {
        await this.resolveDependency({
          action: 'ADD',
          list: [ dependency ]
        })
      } catch (e) {
        throw e
      } finally {
        this.dependencyLoading = false
      }
    },
    async removeDependency (dependency) {
      this.hoverIndex = null // Fixes hover glitch
      this.dependencyLoading = true
      try {
        await this.resolveDependency({
          action: 'REMOVE',
          list: [ dependency ]
        })
      } catch (e) {
        throw e
      } finally {
        this.dependencyLoading = false
      }
    }
  },
  computed: {
    ...mapState('Integration', ['loaded', 'tab']),
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
          name: b,
          version: list[b]
        })
        return a
      }, [])
    },
    resDependencies () {
      return _.get(this, 'loaded.resDependencies', [])
    }
  }
}
</script>

<style lang="stylus" scoped>
#integration-ctx
  .dependency-input
    min-height 30px
    font-size 12px

    >>> .v-input__slot
      min-height 30px

      input
        max-height 30px
        margin-top 0
</style>
