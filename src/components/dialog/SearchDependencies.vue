<template lang="pug">
v-dialog(
  v-model="showDialog"
  max-width="700"
  scrollable
)
  base-card
    v-card-title.headline Add Dependency
    v-card-text
    v-card-actions
      v-spacer
      v-btn(
        @click="showDialog = false"
        flat
      ) Close
</template>

<script>
import { mapActions } from 'vuex'
import { BaseCard } from '@/components/base'
import dialog from '@/mixins/dialog'

export default {
  name: 'SearchDependencies',
  mixins: [ dialog ],
  components: { BaseCard },
  data: () => ({
    loading: false
  }),
  methods: {
    ...mapActions('App', ['setSnackbar']),
    async submit () {
      this.loading = true
      try {
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
