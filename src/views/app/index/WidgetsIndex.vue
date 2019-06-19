<template lang="pug">
v-container(fill-height fluid)
  v-layout(align-center justify-center)
    v-flex(
      v-if="!isAdding && !isExploring"
      xs12 sm12 md10 lg8 xl6
    )
      .display-3.mb-4 Widgets
      .subheading Widgets are the building blocks of your dashboard.
      .subheading They are self-contained components that are fed data from integrations.
      .subheading You can create your own widgets, or search for already existing widgets.
      .subheading Existing widgets can be modified to your own needs.
      v-icon.index-icon mdi-hexagon-multiple

    //- Adding widget preconfig
    v-container.max-800(v-if="isAdding")
      .headline.mb-3 Name
      v-layout
        v-flex
          v-text-field(
            v-model="settings.name"
            hide-details single-line
            autofocus outlined
          )
      .headline.mb-3.mt-4 Select Runtime
      v-layout
        v-flex
          v-select(
            v-model="settings.runtime"
            :items="runtimes"
            :disabled="isLoading"
            item-text="text"
            item-value="runtime"
            hide-details single-line
            outlined
          )
            template(#selection="{ item }")
              v-icon.mr-3(:color="item.color") {{ item.icon }}
              span {{ item.text }}
            template(#item="{ item }")
              v-icon.mr-3(:color="item.color") {{ item.icon }}
              span {{ item.text }}
      v-layout.mt-4
        v-spacer
        v-btn.ma-0.mr-3(
          @click="isAdding = false"
          large outlined
        ) Cancel
        v-btn.ma-0(
          :disabled="isLoading"
          :loading="isLoading"
          @click="submit"
          color="primary"
          large outlined
        ) Create

  //- Explore widgets
  explorer.pa-0(
    v-if="isExploring"
    :config="explorerConfig"
  )
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { Explorer } from '@/components'
import EventBus from '@/lib/eventBus'

export default {
  name: 'WidgetsIndex',
  components: { Explorer },
  data: () => ({
    isAdding: false,
    isExploring: false,
    explorerConfig: {
      type: 'WIDGET',
      local: false
    },
    settings: {
      name: '',
      runtime: 'javascript'
    },
    runtimes: [
      {
        text: 'JavaScript',
        runtime: 'javascript',
        icon: 'mdi-language-javascript',
        color: '#efdb4f'
      }
    ]
  }),
  computed: mapState('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Widget', ['create']),
    async submit () {
      if (!this.settings.name || this.settings.name === '')
        return

      this.setIsLoading(true)
      try {
        await this.create({ settings: this.settings })
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message
        })
      } finally {
        this.setIsLoading(false)
        this.isAdding = false
      }
    }
  },
  mounted () {
    EventBus.$on('vbox:addWidget', () => {
      this.isAdding = true
      this.isExploring = false
    })
    EventBus.$on('vbox:toggleExplorer', () => {
      this.isExploring = !this.isExploring
      this.isAdding = false
    })
  },
  beforeDestroy () {
    EventBus.$off('vbox:addWidget')
    EventBus.$off('vbox:toggleExplorer')
  }
}
</script>

<style lang="stylus" scoped>
.container
  .max-800
    max-width 800px !important

  .flex
    position relative
</style>
