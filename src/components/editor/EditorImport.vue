<template lang="pug">
v-container#editor-import(fill-height)
  v-layout(align-center justify-center)
    v-container
      .headline.mb-3 Import ZIP File
      v-layout
        v-flex
          input(
            type="file"
            ref="file"
          )
      v-layout.mt-4
        v-spacer
        v-btn.ma-0.px-3(
          @click="importZip"
          color="primary"
          large outlined
        )
          v-icon.mr-3 mdi-zip-box
          | Import
      .headline.mb-3.mt-4 Import From GitHub
      v-layout
        v-flex
          span.grey--text
            v-icon.mr-2.d-inline mdi-github-circle
            | Coming soon.
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'EditorImport',
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapActions('Project', ['import']),
    async importZip () {
      // tslint:disable-next-line
      if (confirm('The imported ZIP file will replace all other files in the current project. Do you want to contiue?')) {
        const zip = this.$refs.file.files[0]

        if (!zip)
          return

        try {
          await this.import(zip)
          this.setSnackbar({
            type: 'info',
            msg: 'Successfully imported ZIP',
            timeout: 2500
          })
        } catch (e) {
          this.setSnackbar({
            type: 'error',
            msg: e.message
          })
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../styles/colors';

#editor-import
  max-width 800px
  padding 16px
  position absolute
  top 0; right 0; left 0; bottom 0;
</style>
