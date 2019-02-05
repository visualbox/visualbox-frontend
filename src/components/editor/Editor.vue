<template lang="pug">
#editor
  context-toolbar
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
        //- README viewer
        v-icon(v-if="item.name === '/~README'") mdi-card-text
        template(v-else)
          v-icon.mr-2(:color="item.color") {{ item.icon }}
          template(v-if="item.peek")
            i {{ item.name }}
          template(v-else)
            | {{ item.name }}
          v-icon.ml-2(
            :class="tabIconHidden(index, item.fullPath)"
            @click="PROJECT_CLOSE_OPEN(item.fullPath)"
            @mouseover="hoverIndexIcon = index"
            @mouseout="hoverIndexIcon = null"
            small
          ) {{ tabIcon(index, item.fullPath) }}

      v-spacer
      v-toolbar-items
        v-btn(
          v-if="activeTab > 0"
          @click="formatCode"
          flat
        )
          v-icon mdi-auto-fix
        v-btn(
          :color="showHelper ? 'primary' : ''"
          @click="PROJECT_SET_HELPER(!showHelper)"
          flat
        )
          v-icon mdi-console
  .grid-layout(:class="showHelper ? layoutHelper : 'no-split'")
    .grid-item
      .markdown(
        v-if="activeTab <= 0"
        v-html="compiledMarkdown"
      )
      .monaco(v-if="activeTab > 0")
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
import { parseFileType, fileTypeMeta } from '@/lib/utils'
import { fileContents } from '@/lib/utils/projectUtils'

const README_VIEVER_NAME = '/~README'

export default {
  name: 'Editor',
  components: {
    ContextToolbar
  },
  data: () => ({
    split: Split({}),
    hoverIndex: null,
    hoverIndexIcon: null
  }),
  computed: {
    ...mapState('Project', [
      'files',
      'open',
      'dirty',
      'peek',
      'active',
      'showHelper',
      'layoutHelper'
    ]),
    ...mapGetters('Project', ['fileByFullPath']),
    ...mapGetters('App', ['theme']),
    activeTab: {
      /**
       * Translate fullPath -> tab index
       */
      get () {
        return this.openTabs.findIndex(({ fullPath }) => fullPath && fullPath === this.active)
      },
      /**
       * Translate tab index -> fullPath
       */
      set (index) {
        if (!this.openTabs.hasOwnProperty(index))
          return

        const { fullPath } = this.openTabs[index]
        this.PROJECT_SET_ACTIVE(fullPath)
      }
    },
    openTabs () {
      const open = [...this.open].map(fullPath => this.fullPathMeta(fullPath))

      // Add 'README' tab to beginning with an impossible name
      open.unshift({
        name: README_VIEVER_NAME,
        fullPath: README_VIEVER_NAME,
        icon: null,
        color: null
      })

      if (this.peek) {
        const meta = this.fullPathMeta(this.peek)
        if (meta) {
          meta.peek = true
          open.push(meta)
        }
      }

      return open
    },
    editorModel: {
      get () {
        const file = this.fileByFullPath(this.active)
        if (!file)
          return ''

        return file.contents || ''
      },
      set (contents) {
        this.PROJECT_WRITE_FILE({ fullPath: this.active, contents })
      }
    },
    compiledMarkdown () {
      try {
        const contents = fileContents(this.files, ['README.md'])
        return contents ? marked(contents, { sanitize: true, gfm: true }) : 'No README.md'
      } catch (e) {
        return 'No README.md'
      }
    },
    monacoLanguage () {
      const file = this.fileByFullPath(this.active)
      if (!file)
        return 'text'

      const { fullPath } = file
      const fileType = parseFileType(fullPath)
      const { monacoLanguage } = fileTypeMeta(fileType)
      return monacoLanguage || 'text'
    }
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_RESET',
      'PROJECT_SET_ACTIVE',
      'PROJECT_WRITE_FILE',
      'PROJECT_CLOSE_OPEN',
      'PROJECT_SET_HELPER'
    ]),
    formatCode () {
      this.$refs.editor.getMonaco().trigger('anyString', 'editor.action.formatDocument')
    },
    fullPathMeta (fullPath) {
      const file = this.fileByFullPath(fullPath)
      if (!file)
        return null

      const { name } = file
      const fileType = parseFileType(name)
      const { icon, color } = fileTypeMeta(fileType)

      return { name, fullPath, icon, color }
    },
    tabIconHidden (index, fullPath) {
      return (!this.dirty.has(fullPath)
             && this.hoverIndex !== index
             && fullPath !== this.active)
             ? 'hidden'
             : null
    },
    tabIcon (index, fullPath) {
      return (this.dirty.has(fullPath)
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
    }
  },
  mounted () {
    this.PROJECT_SET_ACTIVE(README_VIEVER_NAME)
  },
  beforeDestroy () {
    this.PROJECT_RESET()
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#editor
  height 100%

  >>> .v-toolbar__content
    padding 0 !important

    .editor-tabs
      .v-tabs__item--active
        box-shadow inset 0 -1px 0 #52b054

      .v-icon
        -webkit-transition none !important
        transition none !important

        &.ml-2
          margin-bottom -2px

        &.mdi-circle-medium
          color #52b054

        &.hidden
          color transparent

      .v-tabs__div
        font-weight unset
        text-transform unset

        .v-tabs__item
          -webkit-transition none !important
          transition none !important

          &--active
            background-color $vb-application

      .v-btn
        padding 0
        min-width 48px

  .grid-layout
    display grid
    position absolute
    top 48px; right 0; left 0; bottom 0;

    .grid-item
      position relative
      overflow-y auto
      overflow-x hidden

      &.gutter
        z-index 20

    &.vertical
      grid-template none / 3fr 0 1fr
      grid-template-rows unset !important

      .gutter
        width 10px
        margin-left -5px

        &:hover
          cursor col-resize

    &.horizontal
      grid-template 3fr 0 1fr / none
      grid-template-columns unset !important

      .gutter
        height 35px
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
