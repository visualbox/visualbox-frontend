<template lang="pug">
#integration(v-if="loaded")
  context-toolbar
    v-tabs.editor-tabs(
      v-model="localTab"
      color="transparent"
      slider-color="primary"
    )
      v-tab(:ripple="false").black
        v-icon mdi-card-text
      v-tab(
        v-for="(item, index) in listFiles"
        :key="index"
        :ripple="false"
      )
        v-icon.mr-2(
          :color="FILE_TYPES[item.file].color"
          small
        ) {{ FILE_TYPES[item.file].icon }}
        | {{ item.text}}
      v-spacer
      v-toolbar-items
        v-btn(
          v-if="localTab !== 0"
          @click="formatCode"
          flat
        )
          v-icon mdi-auto-fix
        v-btn(
          :color="showHelper ? 'primary' : ''"
          @click="INTEGRATION_SET_HELPER(!showHelper)"
          flat
        )
          v-icon mdi-console

  .grid-layout(:class="showHelper ? layoutHelper : 'no-split'")
    .grid-item
      .markdown(
        v-if="localTab === 0"
        v-html="compiledMarkdown"
      )
      .monaco(v-if="localTab !== 0")
        monaco-editor(
          :theme="'vs-' + theme"
          v-model="editorModel"
          ref="editor"
          :language="file.monacoSyntax"
        )
    template(v-if="showHelper")
      .grid-item.gutter(ref="gutter")
      .grid-item
        helper-integration
</template>

<script>
import Split from 'split-grid'
import marked from 'marked'
import * as _ from 'lodash'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, MonacoEditor } from '@/components'
import { HelperIntegration } from '@/components/helper'
import FILE_TYPES from '@/lib/fileTypes'

export default {
  name: 'Integration',
  components: {
    ContextToolbar,
    HelperIntegration,
    MonacoEditor
  },
  data: () => ({
    split: Split({}),
    FILE_TYPES,
    listFiles: [
      {
        text: 'config.json',
        key: 'config',
        file: 'json',
        monacoSyntax: 'json',
        tab: 1
      },
      {
        text: 'index.js',
        key: 'source',
        file: 'js',
        monacoSyntax: 'javascript',
        tab: 2
      },
      {
        text: 'package.json',
        key: 'package',
        file: 'json',
        monacoSyntax: 'json',
        tab: 3
      },
      {
        text: 'README.md',
        key: 'readme',
        file: 'md',
        monacoSyntax: 'markdown',
        tab: 4
      }
    ]
  }),
  watch: {
    loaded: {
      handler: _.debounce(async function (newVal, oldVal) {
        // Don't display 'Saved changes' when changing integration
        if (newVal === null || oldVal === null || newVal.id !== oldVal.id)
          return

        try {
          await this.commitLoaded()
          this.setSnackbar({
            type: 'info',
            msg: `Saved changes`,
            timeout: 1500
          })
        } catch (e) {}
      }, process.env.VUE_APP_COMMIT_DEBOUNCE),
      deep: true
    },
    showHelper: {
      immediate: true,
      handler: function (val) {
        // Remove all
        if (!val) {
          this.split.removeColumnGutter(1)
          this.split.removeRowGutter(1)
          return
        }

        // Add new
        this.$nextTick(() => {
          if (this.layoutHelper === 'vertical')
            this.split.addColumnGutter(this.$refs.gutter, 1)
          else
            this.split.addRowGutter(this.$refs.gutter, 1)
        })
      }
    },
    layoutHelper (newVal, oldVal) {
      // Remove old & add new
      if (oldVal === 'vertical') {
        this.split.removeColumnGutter(1)
        this.split.addRowGutter(this.$refs.gutter, 1)
      } else {
        this.split.removeRowGutter(1)
        this.split.addColumnGutter(this.$refs.gutter, 1)
      }
    }
  },
  computed: {
    ...mapState('Integration', ['loaded', 'tab', 'showHelper', 'layoutHelper']),
    ...mapGetters('App', ['theme']),
    localTab: {
      get () { return this.tab },
      set: function (val) { this.INTEGRATION_SET_TAB(val) }
    },
    file () {
      return this.listFiles.find(({ tab }) => tab === this.localTab)
    },
    compiledMarkdown () {
      try {
        const readme = _.get(this, 'loaded.readme', '')
        return marked(readme, {
          sanitize: true,
          gfm: true
        })
      } catch (e) {
        return null
      }
    },
    editorModel: {
      get () {
        if (this.file.key === 'package') {
          try {
            return JSON.stringify(_.get(this, 'loaded.package', {}), null, 2)
          } catch (e) {
            return '{}'
          }
        }

        return _.get(this, `loaded.${this.file.key}`, '')
      },
      set (val) {
        if (this.file.key === 'package') {
          try {
            this.updateLoaded({ package: JSON.parse(val) })
          } catch (e) {}

          return
        }

        this.updateLoaded({ [this.file.key]: val })
      }
    }
  },
  methods: {
    ...mapMutations('Integration', ['INTEGRATION_SET_TAB', 'INTEGRATION_SET_HELPER']),
    ...mapActions('App', ['setSnackbar']),
    ...mapActions('Integration', ['load', 'updateLoaded', 'closeLoaded', 'commitLoaded']),
    formatCode () {
      this.$refs.editor.getMonaco().trigger('anyString', 'editor.action.formatDocument')
    }
  },
  mounted () {
    this.load(this.$route.params.id)
  },
  beforeDestroy () {
    this.closeLoaded()
    this.split.destroy()
  }
}
</script>

<style lang="stylus" scoped>
@import '../../../assets/styles/colors';

#integration
  height 100%

  >>> .v-toolbar__content
    padding 0 !important

  .grid-layout
    display grid
    position absolute
    top 48px; right 0; left 0; bottom 0;

    .grid-item
      position relative
      overflow-y auto
      overflow-x hidden

      &.gutter
        background $vb-gutter

    &.vertical
      grid-template none / 3fr 10px 1fr
      grid-template-rows unset !important

      .gutter, .gutter:hover
        cursor col-resize

    &.horizontal
      grid-template 3fr 10px 1fr / none
      grid-template-columns unset !important

      .gutter, .gutter:hover
        cursor row-resize

    &.no-split
      grid-template-rows unset !important
      grid-template-columns unset !important

  .markdown
    padding 16px

  .monaco
    position absolute
    top 0; right 0; left 0; bottom 0;
    overflow hidden

    > div
      height 100%
</style>
