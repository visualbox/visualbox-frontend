<template lang="pug">
#editor
  context-toolbar(v-if="editorIsOpen")
    v-tabs.editor-tabs(
      v-model="activeTab"
      color="transparent"
      hide-slider
    )
      //- Open files
      v-tab(
        v-for="(item, index) in openTabs"
        @mouseover="hoverIndex = index"
        @mouseout="hoverIndex = null"
        :key="index"
        :ripple="false"
      )
        template
          v-icon.mr-2(:color="item.color") {{ item.icon }}
          template(v-if="item.peek")
            i {{ item.displayName }}
          template(v-else)
            | {{ item.displayName }}
          v-icon.ml-2(
            :class="tabIconHidden(index, item.name)"
            @click="PROJECT_CLOSE_OPEN(item.name)"
            @mouseover="hoverIndexIcon = index"
            @mouseout="hoverIndexIcon = null"
            small
          ) {{ tabIcon(index, item.name) }}

      v-spacer
      v-toolbar-items
        v-btn(
          @click="formatCode"
          text
        )
          v-icon mdi-auto-fix
  .grid-layout(
    :class="showHelper ? layoutHelper : 'no-split'"
    :nudge-tabs="editorIsOpen"
  )
    .grid-item
      .markdown(
        v-if="showInfo"
        v-html="compiledMarkdown"
      )
      editor-settings(v-else-if="showSettings")
      editor-import(v-else-if="showImport")
      .monaco(v-else)
        monaco-editor(
          :theme="'vs-' + theme"
          :language="monacoLanguage"
          v-model="editorModel"
          ref="editor"
        )
    template(v-if="showHelper")
      .grid-item.gutter(ref="gutter")
      .grid-item
        slot(name="helper")
</template>

<script>
import Split from 'split-grid'
import marked from 'marked'
import { mapState, mapMutations, mapGetters } from 'vuex'
import { ContextToolbar } from '@/components'
import EditorSettings from '@/components/editor/EditorSettings'
import EditorImport from '@/components/editor/EditorImport'
import { parseFileType, fileTypeMeta } from '@/lib/utils'
import { Zip } from '@/service'

export default {
  name: 'Editor',
  components: {
    ContextToolbar,
    EditorSettings,
    EditorImport
  },
  data: () => ({
    split: Split({
      rowMinSizes: { 0: 0.1 },
      columnMinSizes: { 0: 0.1 }
    }),
    hoverIndex: null,
    hoverIndexIcon: null,
    initEditorModel: true,
    editorModel: '',
    compiledMarkdown: ''
  }),
  computed: {
    ...mapState('Project', [
      'zip',
      'open',
      'dirty',
      'peek',
      'active',
      'showInfo',
      'showSettings',
      'showImport',
      'showHelper',
      'layoutHelper'
    ]),
    ...mapGetters('Project', ['fileByFullPath']),
    ...mapGetters('App', ['theme']),
    editorIsOpen () {
      return !this.showInfo && !this.showSettings && !this.showImport
    },
    activeTab: {
      /**
       * Translate name -> tab index
       */
      get () {
        return this.openTabs.findIndex(({ name }) => name && name === this.active)
      },
      /**
       * Translate tab index -> name
       */
      set (index) {
        if (!this.openTabs.hasOwnProperty(index) || !this.active)
          return

        const { name } = this.openTabs[index]
        this.PROJECT_SET_ACTIVE(name)
      }
    },
    openTabs () {
      const open = [...this.open].map(name => this.fileMeta(name))

      if (this.peek) {
        const meta = this.fileMeta(this.peek)
        if (meta) {
          meta.peek = true
          open.push(meta)
        }
      }

      return open
    },
    monacoLanguage () {
      const { monacoLanguage } = fileTypeMeta(this.active)
      return monacoLanguage || 'text'
    }
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_SET_ACTIVE',
      'PROJECT_CLOSE_OPEN',
      'PROJECT_TOUCH_FILE'
    ]),
    formatCode () {
      this.$refs.editor.getMonaco().trigger('anyString', 'editor.action.formatDocument')
    },
    fileMeta (name) {
      const displayName = name.split('/').pop()

      const fileType = parseFileType(displayName)
      const { icon, color } = fileTypeMeta(fileType)

      return { name, displayName, icon, color }
    },
    tabIconHidden (index, name) {
      return (!this.dirty.has(name)
             && this.hoverIndex !== index
             && name !== this.active)
             ? 'hidden'
             : null
    },
    tabIcon (index, name) {
      return (this.dirty.has(name)
             && this.hoverIndexIcon !== index)
             ? 'mdi-circle-medium'
             : 'mdi-close'
    }
  },
  watch: {
    showHelper: {
      immediate: true,
      handler (val) {
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
    },
    async active (name) {
      this.initEditorModel = true

      let newEditorModel
      try {
        newEditorModel = await Zip.readFile(name)
      } catch (e) {
        newEditorModel = ''
      }

      // Force update
      if (newEditorModel === this.editorModel)
        this.initEditorModel = false

      this.editorModel = newEditorModel
    },
    editorModel (contents) {
      // Don't write if active has marked as inited
      if (this.initEditorModel) {
        this.initEditorModel = false
        return
      }

      Zip.writeFile({
        name: this.active,
        contents
      })
      this.PROJECT_TOUCH_FILE(this.active)
    },
    showInfo: {
      immediate: true,
      async handler (val) {
        if (!val)
          return

        let compiledMarkdown = 'No README.md'
        try {
          const contents = await Zip.readFile('README.md')
          if (contents)
            compiledMarkdown = marked(contents, { sanitize: true, gfm: true })
        } catch (e) {
          // Silent
        }

        this.compiledMarkdown = compiledMarkdown
      }
    }
  },
  beforeDestroy () {
    this.split.destroy()
  }
}
</script>

<style lang="stylus" scoped>
@import '../../styles/colors';

#editor
  height 100%

  >>> .v-toolbar__content
    padding 0 !important

    .editor-tabs
      margin-right 0 !important
      margin-left 0 !important

      .v-tabs-bar
        background none

      .v-tab
        color #FFF
        font-weight unset
        text-transform unset

        -webkit-transition none !important
        transition none !important

        &--active
          background-color $vb-application
          box-shadow inset 0 -1px 0 #52b054
        
        &:hover:before
          opacity 0 !important
          -webkit-transition none !important
          transition none !important

      .v-icon
        -webkit-transition none !important
        transition none !important

        &.ml-2
          margin-bottom -2px

        &.mdi-circle-medium
          color #52b054

        &.hidden
          color transparent

      .v-btn
        padding 0
        min-width 48px

  .grid-layout
    display grid
    position absolute
    top 0; right 0; left 0; bottom 0;

    .grid-item
      position relative
      overflow-y auto
      overflow-x hidden

      &.gutter
        z-index 20

    &[nudge-tabs]
      top 48px

    &.vertical
      grid-template-rows unset !important
      grid-template-columns 3fr 0 1fr

      .gutter
        width 10px
        margin-left -5px

        &:hover
          cursor col-resize

    &.horizontal
      grid-template-rows 3fr 0 1fr
      grid-template-columns unset !important

      .gutter
        height 45px
        margin-top -5px

        &:hover
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
