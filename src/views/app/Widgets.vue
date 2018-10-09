<template lang="pug">
#widgets
  app-context-toolbar
    .subheading Widgets
    v-spacer
    v-btn(
      icon
      @click="showSearch = !showSearch"
    )
      v-icon(v-if="!showSearch") mdi-magnify
      v-icon(v-if="showSearch") mdi-close
    v-btn(
      icon
      @click="submit"
      :loading="isLoading"
      :disabled="isLoading"
    )
      v-icon mdi-plus-box

  //- Search
  .pa-2(v-if="showSearch")
    v-text-field.search(
      clearable solo flat
      single-line autofocus
      label="Search widgets"
      :loading="false"
    )

  //- List
  v-list(v-if="!showSearch")
    v-list-tile(
      v-for="(item, index) in list"
      :key="index"
    )
      v-list-tile-title {{ item.label }}
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import AppContextToolbar from '@/components/app/AppContextToolbar'
import NewWidget from '@/components/dialog/NewWidget'

export default {
  name: 'Widgets',
  components: {
    AppContextToolbar,
    NewWidget
  },
  data: () => ({
    showDialog: false,
    showSearch: false
  }),
  computed: {
    ...mapGetters('App', ['isLoading']),
    ...mapGetters('Widget', ['list'])
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Widget', ['create']),
    async submit () {
      this.setIsLoading(true)
      try {
        await this.create()
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
#widgets
  .v-list
    padding 0
</style>
