<template lang="pug">
#integration-ctx(v-if="loaded")
  app-context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ label }}

  v-list.editor-list(dense)
    //- Files
    v-list-tile.no-style(@click="open.files = !open.files")
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
        v-icon(small :color="FILE_TYPES[item.file].color") {{ FILE_TYPES[item.file].icon }}
      v-list-tile-content {{ item.text }}

    //- Dependencies
    v-list-tile.no-style(@click="open.dependencies = !open.dependencies")
      v-list-tile-action
        v-icon {{ open.dependencies ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Dependencies

    //- Settings
    v-list-tile.no-style(@click="open.settings = !open.settings")
      v-list-tile-action
        v-icon {{ open.settings ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Settings
    v-container(
      v-if="open.settings"
      grid-list-lg
    )
      v-layout(row wrap)
        v-flex(xs12)
          v-text-field(
            v-model="label"
            label="Label"
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
</template>

<script>
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions } from 'vuex'
import { AppContextToolbar } from '@/components/app'
import { FILE_TYPES } from '@/lib/fileTypes'

export default {
  name: 'IntegrationCtx',
  components: { AppContextToolbar },
  data: () => ({
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
    ...mapActions('Integration', ['updateLoaded']),
    ...mapActions('App', ['setSnackbar']),
    ...mapMutations('Integration', ['INTEGRATION_SET_TAB'])
  },
  computed: {
    ...mapState('Integration', ['loaded', 'tab']),
    label: {
      get () {
        return _.get(this, 'loaded.label', '')
      },
      set (label) {
        this.updateLoaded({ label })
      }
    },
    public: {
      get () {
        return _.get(this, 'loaded.public', false)
      },
      set (isPublic) {
        this.updateLoaded({ public: isPublic })
      }
    }
  }
}
</script>
