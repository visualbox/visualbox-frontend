<template lang="pug">
#integration-ctx(v-if="loaded")
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
  name: 'IntegrationCtx',
  components: { AppContextToolbar },
  methods: {
    ...mapActions('Integration', ['updateLoaded']),
    ...mapActions('App', ['setSnackbar'])
  },
  computed: {
    ...mapGetters('Integration', ['loaded']),
    label: {
      get () {
        return _.get(this, 'loaded.label', '')
      },
      set (label) {
        this.updateLoaded({ label })
      }
    },
    public: {
      get () {
        return _.get(this, 'loaded.public', false)
      },
      set (isPublic) {
        this.updateLoaded({ public: isPublic })
      }
    },
    updatedAt () {
      const { updatedAt } = this.loaded
      return moment(updatedAt).format('DD/MM HH:mm:ss')
    }
  }
}
</script>

<style lang="stylus" scoped>
#integration-ctx
  height 100%
  overflow auto
</style>
