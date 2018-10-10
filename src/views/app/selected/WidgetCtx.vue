<template lang="pug">
#widget-ctx
  app-context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ widget.label }}

  v-form.pa-3
    v-text-field.mb-3(
      v-model="widget.label"
      label="Label"
      outline
    )
</template>

<script>
import { mapGetters } from 'vuex'
import AppContextToolbar from '@/components/app/AppContextToolbar'

export default {
  name: 'WidgetCtx',
  components: { AppContextToolbar },
  computed: {
    ...mapGetters('Widget', ['widgetById']),
    widget () {
      return this.widgetById(this.$route.params.id)
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
