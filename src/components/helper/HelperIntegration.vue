<template lang="pug">
#helper-integration
  v-system-bar
    .tab(
      :active="tab === 0"
      @click="tab = 0"
    ) Configure
    .tab(
      :active="tab === 1"
      @click="tab = 1"
    ) Console
    tooltip(text="Clear Console" :open-delay="800" top)
      v-icon.ml(
        @click="consoleBuffer = []"
        color="red"
      ) mdi-cancel
    v-spacer
    tooltip(text="Restart" :open-delay="800" top)
      v-icon(@click="") mdi-restart
    tooltip(text="Freeze Console" :open-delay="800" top)
      v-icon(
        :color="freeze ? 'blue' : ''"
        @click="freeze = !!!freeze"
      ) mdi-snowflake
    tooltip(text="Dock to Bottom" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'horizontal' ? 'primary' : ''"
        @click="PROJECT_SET_HELPER_LAYOUT('horizontal')"
      ) mdi-page-layout-footer
    tooltip(text="Dock to Right" :open-delay="800" top)
      v-icon(
        :color="layoutHelper === 'vertical' ? 'primary' : ''"
        @click="PROJECT_SET_HELPER_LAYOUT('vertical')"
      ) mdi-page-layout-sidebar-right
    v-icon(@click="PROJECT_SET_HELPER(false)") mdi-close
  .pane(:active="tab === 0")
    input-types(
      v-if="false"
      v-model="model"
      :config="parsedConfig"
    )
  .pane(:active="tab === 1")
    pre {{ active }} - {{ status }}
    .ln(
      v-for="(item, index) in consoleBuffer"
      :key="index"
      :error="item.error"
    ) {{ item.line }}
</template>

<script>
import get from 'lodash-es/get'
import debounce from 'lodash-es/debounce'
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import { InputTypes, Tooltip } from '@/components'


export default {
  name: 'HelperIntegration',
  components: {
    InputTypes,
    Tooltip
  },
  data: () => ({
    model: {},
    tab: 1,
    consoleBuffer: [],
    freeze: false
  }),
  computed: {
    ...mapState('Project', ['layoutHelper']),
    ...mapState('Project', ['active', 'status'])
  },
  methods: {
    ...mapMutations('Project', [
      'PROJECT_SET_HELPER_LAYOUT',
      'PROJECT_SET_HELPER'
    ]),
    ...mapActions('Project', ['save']),
    ...mapActions('Bundler', ['queueBundle'])
  },
  async mounted () {
    try {
      this.queueBundle({
        project: await this.save(),
        cb: (err, status) => {
          console.log('Queue bundle ready', err, status)
        }
      })
    } catch (e) {
      console.log('Mount bundle error', e)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#helper-integration
  height 100%
  background #000

  .v-system-bar
    margin 0
    padding 0
    height 30px !important
    background rgba(255, 255, 255, .2)

    .tab
      padding 5px 6px
      display inline-block
      cursor pointer

      &[active]
        color white
        background #000

    // Place above gutter overlay
    .tab, .v-tooltip, .v-icon
      z-index 25

    .v-icon
      margin-right 10px

      &.ml
        margin-left 10px

  .pane
    visibility hidden
    padding 16px
    position absolute
    top 30px; right 0; left 0; bottom 0;
    overflow auto

    &[active]
      visibility visible

    .ln
      font-family monospace
      word-break break-all

      &[error]
        color red
</style>
