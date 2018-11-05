<template lang="pug">
#widgets-ctx
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
      @mouseover="hoverIndex = index"
      @mouseout="hoverIndex = null"
      @click="$router.push(`/app/w/${item.id}`)"
    )
      v-list-tile-content
        v-list-tile-sub-title {{ item.label }}
      v-list-tile-action(v-if="index === hoverIndex")
        v-btn(
          flat icon
          @click.stop="del(item.id)"
        )
          v-icon(small) mdi-trash-can-outline
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'WidgetsCtx',
  components: { AppContextToolbar },
  data: () => ({
    showSearch: false,
    hoverIndex: null
  }),
  computed: {
    ...mapGetters('App', ['isLoading']),
    ...mapGetters('Widget', ['list'])
  },
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Widget', ['create', 'del']),
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
#widgets-ctx
  .v-list
    padding 0
</style>
