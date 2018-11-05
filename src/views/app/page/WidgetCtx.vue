<template lang="pug">
#widget-ctx(v-if="loaded")
  app-context-toolbar
    v-btn(
      icon
      @click="$router.go(-1)"
    )
      v-icon mdi-menu-left
    .subheading {{ label }}

  v-container.pa-3(grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        v-text-field(
          v-model="label"
          label="Label"
          hide-details
          outline
        )
      v-flex(xs12)
        v-switch(
          v-model="public"
          label="Public"
          color="primary"
          hide-details
        )
      v-flex(xs12)
        .body-1.font-weight-thin.text-xs-right.grey--text Updated: {{ updatedAt }}
</template>

<script>
import * as _ from 'lodash'
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex'
import { AppContextToolbar } from '@/components/app'

export default {
  name: 'WidgetCtx',
  components: { AppContextToolbar },
  methods: mapActions('Widget', ['updateLoaded']),
  computed: {
    ...mapGetters('Widget', ['loaded']),
    label: {
      get () {
        return this.loaded.label
      },
      set: _.debounce(function (label) {
        this.updateLoaded({ label })
      }, process.env.VUE_APP_COMMIT_DEBOUNCE)
    },
    public: {
      get () {
        return this.loaded.public
      },
      set: _.debounce(function (isPublic) {
        this.updateLoaded({ public: isPublic })
      }, process.env.VUE_APP_COMMIT_DEBOUNCE)
    },
    updatedAt () {
      const { updatedAt } = this.loaded
      return moment(updatedAt).format('DD/MM HH:mm:ss')
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
