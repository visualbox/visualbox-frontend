<template lang="pug">
#editor-ctx
  context-toolbar
    v-btn(@click="goBack" icon)
      v-icon mdi-menu-left
    .subheading {{ settings.name }}
    template(v-if="dirty.size > 0")
      v-spacer
      v-btn(@click="saveProject" icon)
        v-icon mdi-floppy

  v-list.hover-actions(dense)
    //- Info
    v-list-tile(
      @click="showPage('info')"
      :class="{ 'v-list__tile--active' : showInfo }"
    )
      v-list-tile-content View Info

    //- Settings
    v-list-tile(
      @click="showPage('settings')"
      :class="{ 'v-list__tile--active' : showSettings }"
    )
      v-list-tile-content Settings

    //- Files
    v-list-tile.no-hover(@click="openPanel.files = !openPanel.files")
      v-list-tile-action.hover-actions-always
        v-icon {{ openPanel.files ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
      v-list-tile-content Files
      v-list-tile-action
        tooltip(text="Add File" :open-delay="800" bottom)
          v-icon(@click.stop="addFile" small) mdi-file-plus
      v-list-tile-action
        tooltip(text="Add Folder" :open-delay="800" bottom)
          v-icon(@click.stop="addFolder" small) mdi-folder-plus

    v-treeview(
      v-if="openPanel.files"
      :items="projectFiles"
      :active.sync="activeTab"
      :open.sync="openTree"
      :edit-file="editFileFullPath"
      item-key="fullPath"
      activatable
      open-on-click
    )
      template(#prepend="{ item, open }")
        v-icon(
          v-if="item.type === 'folder'"
          small
        ) {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
        template(v-else)
          v-icon.dirty(
            v-if="dirty.has(item.fullPath)"
            color="#52b054"
            small
          ) mdi-circle-medium
          v-icon(
            :color="fileTypeMeta(item.file).color"
            small
          ) {{ fileTypeMeta(item.file).icon }}
      template(#label="{ item }")
        input.edit-file-input(
          v-if="item.fullPath === editFileFullPath"
          v-model="editFileName"
          :ref="{ 'editFile' : item.fullPath === editFileFullPath }"
          @keyup.enter.stop="editFileBlur"
          @blur="editFileBlur"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        )
        span(v-else) {{ item.name }}
      template(#append="{ item }")
        .options(v-if="item.fullPath !== editFileFullPath")
          template(v-if="item.type === 'folder'")
            tooltip(text="Add File" :open-delay="800" bottom)
              v-icon(@click.stop="addFile(item)" small) mdi-file-plus
            tooltip(text="Add Folder" :open-delay="800" bottom)
              v-icon(@click.stop="addFolder(item)" small) mdi-folder-plus
          tooltip(text="Rename" :open-delay="800" bottom)
            v-icon(@click.stop="editFile(item)" small) mdi-textbox
          tooltip(text="Delete" :open-delay="800" bottom)
            v-icon(@click.stop="deleteFile(item)" small) mdi-trash-can-outline
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { ContextToolbar, Tooltip } from '@/components'
import { fileTypeMeta, cloneDeep } from '@/lib/utils'
import EventBus from '@/lib/eventBus'

const DOUBLE_CLICK_TIMEOUT = 500

export default {
  name: 'EditorCtx',
  components: {
    ContextToolbar,
    Tooltip
  },
  data: () => ({
    fileTypeMeta,
    openPanel: {
      files: true,
      settings: false
    },
    openTree: [],
    localActive: [],
    lastClick: +new Date(),
    editFileFullPath: null,
    editFileName: null
  }),
  computed: {
    ...mapState('Route', ['path']),
    ...mapGetters('Project', ['projectFiles']),
    ...mapState('Project', [
      'showInfo',
      'showSettings',
      'settings',
      'active',
      'dirty'
    ]),
    activeTab: {
      get () { return !this.active ? [] : [ this.active ] },
      set (val) { this.localActive = val }
    }
  },
  watch: {
    /**
     * localActive is the write-to variable after a
     * mutation of active is changed in this component.
     * This is so that we can intervene and check if
     * it was a double click or a single click.
     */
    localActive ([ newVal ], [ oldVal ]) {
      const dblClicked = this.isDoubleClick(newVal, oldVal)
      if (dblClicked)
        this.doubleClick(dblClicked)
      else if (newVal)
        this.click(newVal)
    },
  },
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapMutations('Project', [
      'PROJECT_SHOW_INFO',
      'PROJECT_SHOW_SETTINGS',
      'PROJECT_SET_ACTIVE'
    ]),
    ...mapActions('Project', [
      'doubleClick',
      'click',
      'addNewFile',
      'addNewFolder',
      'deleteNestedFile',
      'renameNestedFile',
      'save'
    ]),
    /**
     * Check if it was a double click by looking
     * at previous and present values, combined
     * with the time the last check happened.
     */
    isDoubleClick (newVal, oldVal) {
      const lastClick = this.lastClick
      this.lastClick = +new Date()
      const diff = this.lastClick - lastClick

      if (!newVal && oldVal && diff < DOUBLE_CLICK_TIMEOUT)
        return oldVal
      if (newVal && !oldVal && diff < DOUBLE_CLICK_TIMEOUT)
        return newVal
      return null
    },
    async addFile ({ fullPath, type }) {
      this.openPanel.files = true

      try {
        fullPath = fullPath || ''
        const newFile = await this.addNewFile(fullPath)

        // Ensure folder is open when adding file to it
        if (type === 'folder')
          this.openTree.push(fullPath)

        this.editFile(newFile)
      } catch (e) {
        console.log(e)
      }
    },
    async addFolder ({ fullPath, type }) {
      this.openPanel.files = true

      try {
        fullPath = fullPath || ''
        const newFile = await this.addNewFolder(fullPath)

        // Ensure folder is open when adding folder to it
        if (type === 'folder')
          this.openTree.push(fullPath)

        this.editFile(newFile)
      } catch (e) {
        console.log(e)
      }
    },
    deleteFile ({ fullPath }) {
      if (confirm('Are you sure you want to delete the file?'))
        this.deleteNestedFile(fullPath)
    },
    /**
     * Edit a file by storing the fullPath of the file
     * and the name as v-model of the file.
     * A dynamic $ref is created for the input and is
     * used to focus the input, and selecting (if possible)
     * only the file name and not the file ending.
     */
    editFile ({ fullPath, name }) {
      this.editFileFullPath = fullPath
      this.editFileName = name

      this.$nextTick(() => {
        const input = this.$refs[Object.keys(this.$refs)[0]]
        input.focus()

        if (typeof input.selectionStart !== 'undefined') {
          const lastDotIndex = name.lastIndexOf('.')
          input.selectionStart = 0
          input.selectionEnd = lastDotIndex < 0 ? name.length : lastDotIndex
        }
      })
    },
    /**
     * When input is blurred, update file name.
     */
    editFileBlur () {
      if (this.editFileFullPath === null || this.editFileName === null)
        return

      this.renameNestedFile({
        fullPath: this.editFileFullPath,
        newName: this.editFileName
      })
      this.editFileFullPath = null
      this.editFileName = null
    },
    /**
     * Save and commit the project.
     */
    saveProject () {
      EventBus.$emit('vbox:saveProject')
    },
    showPage (page) {
      this.PROJECT_SET_ACTIVE(null)

      if (page === 'info')
        this.PROJECT_SHOW_INFO()
      else
        this.PROJECT_SHOW_SETTINGS()
    },
    /**
     * Need to calculate destination because
     * confusion can arise if coming from
     * public site.
     */
    goBack () {
      try {
        this.$router.push(this.path.split('/').splice(0, 3).join('/'))
      } catch (e) {
        this.$router.push('/app/d')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#editor-ctx
  >>> .v-list
    .v-icon, .v-list__tile__content
      color rgba(255, 255, 255, .7)

    .v-list__tile
      padding-left 40px

      a, a:active, a:visited
        color #FFF

        &:hover
          text-decoration underline

    .no-hover
      .v-list__tile
        padding-left 16px

        &:hover
          background-color unset !important

        &:before
          display none

    .container
      padding-left 40px

    .v-treeview
      padding-left 16px

      &[edit-file]
        background $vb-application

        .edit-file-input
          width 95%
          outline none
          border none
          background $vb-drawer-ctx

      .dirty
        position absolute
        margin-left -20px

      &:not([edit-file]) .v-treeview-node__root
        &:hover:before
          content ''
          width 100%
          height 35px
          position absolute
          left 0
          background-color $vb-primary-list-hover
          z-index 6

        &.v-treeview-node--active:before
            content ''
            width 100%
            height 35px
            position absolute
            left 0
            background-color $vb-primary-list-active
            z-index 6

        &:hover .options
          display block

      .v-treeview-node--active
        background unset

      .v-treeview-node__label
        font-size 13px
        color rgba(255, 255, 255, .7)
        z-index 7

      .options
        display none
        padding-right 5px
        z-index 7

        .v-icon
          padding-right 10px
</style>
