<template lang="pug">
#integration-ctx(v-if="loaded")
  app-context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ label }}

  v-list(dense)
    //- Files
    v-list-tile(@click="open.files = !open.files")
      v-list-tile-action
        v-icon {{ open.files ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Files
    v-list-tile(
      v-if="open.files"
      v-for="(item, index) in listFiles"
      :key="index"
    )
      v-list-tile-action
        v-icon(small :color="FILE_TYPES[item.file].color") {{ FILE_TYPES[item.file].icon }}
      v-list-tile-content {{ item.text }}

    //- Dependencies
    v-list-tile(@click="open.dependencies = !open.dependencies")
      v-list-tile-action
        v-icon {{ open.dependencies ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Dependencies

    //- Settings
    v-list-tile(@click="open.settings = !open.settings")
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
import { mapState, mapActions } from 'vuex'
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
      { text: 'config.json', file: 'json' },
      { text: 'index.js', file: 'js' },
      { text: 'package.json', file: 'json' },
      { text: 'README.md', file: 'md' }
    ]
  }),
  methods: {
    ...mapActions('Integration', ['updateLoaded']),
    ...mapActions('App', ['setSnackbar'])
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

<style lang="stylus" scoped>
#integration-ctx
  height 100%
  overflow auto
</style>
