<template lang="pug">
#dashboard-settings
  v-container.pa-3(grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        v-expansion-panel
          v-expansion-panel-content
            div(slot="header")
              v-avatar.mr-3(
                :size="30"
                :color="bgc"
              )
              | Background Color
            color-picker(v-model="bgc")
      v-flex(xs12)
        v-text-field(
          v-model="label"
          label="Label"
          hide-details
          outline
        )
</template>

<script>
import * as _ from 'lodash'
import { Chrome } from 'vue-color'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'DashboardSettings',
  components: {
    'color-picker': Chrome
  },
  data: () => ({
    colors: '#FFF'
  }),
  computed: {
    ...mapState('Dashboard', ['loaded']),
    label: {
      get () {
        return this.loaded.label
      },
      set (label) {
        this.updateLoaded({ label })
      }
    },
    bgc: {
      get () {
        const { r, g, b, a } = this.loaded.settings.rgba
        return `rgba(${r}, ${g}, ${b}, ${a})`
      },
      set: _.debounce(function (val) {
        const { rgba } = val
        this.updateLoaded({ settings: { rgba } })
      }, 20)
    }
  },
  methods: mapActions('Dashboard', ['updateLoaded'])
}
</script>

<style lang="stylus" scoped>
#dashboard-settings
  .v-expansion-panel, .v-expansion-panel__container
    border-radius 4px
</style>
