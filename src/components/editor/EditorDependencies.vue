<template lang="pug">
#editor-dependencies
  v-list-tile.no-hover(@click="open = !open")
    v-list-tile-action.hover-actions-always
      v-icon {{ open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
    v-list-tile-content Dependencies
  template(v-if="open")
    v-list-tile(
      v-for="(item, index) in projectDependencies"
      :key="index"
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
          @click.stop=""
          flat icon
        )
          v-icon(small) mdi-trash-can-outline
        .grey--text.pr-2 {{ item.version }}
    v-container.pt-2
      v-text-field.dependency-input(
        v-model="input"
        @keyup.enter.native="addDependency"
        :loading="loading"
        :disabled="loading"
        placeholder="Enter package name"
        hide-details outline single-line
      )
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

const DOUBLE_CLICK_TIMEOUT = 500

export default {
  name: 'EditorDependencies',
  data: () => ({
    open: false,
    loading: false,
    input: null
  }),
  computed: mapGetters('Project', ['projectDependencies']),
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapActions('Project', ['resolveDependency']),
    async addDependency () {
      this.loading = true
      const input = this.input
      this.input = ''
      try {
        await this.resolveDependency({
          action: 'ADD',
          list: [ input ]
        })
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },
    async removeDependency (dependency) {
      this.loading = true
      try {
        await this.resolveDependency({
          action: 'REMOVE',
          list: [ dependency ]
        })
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#editor-dependencies
  .dependency-input
    min-height 30px
    font-size 12px

    >>> .v-input__slot
      min-height 30px

      input
        max-height 30px
        margin-top 0
</style>
