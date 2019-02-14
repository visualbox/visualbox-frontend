<template lang="pug">
v-container(fill-height)
  v-layout(align-center justify-center)
    v-flex(
      v-if="!isAdding"
      xs12 sm12 md10 lg8 xl6
    )
      .display-3.mb-4 Integrations
      .subheading Integrations are the engines behind your dashboard.
      .subheading They fetch, process and format data to be displayed by widgets.
      .subheading You can create your own integration, or search for already existing integrations.
      .subheading Existing integrations can be modified to your own needs.
      v-icon.index-icon mdi-source-fork

    //- Adding integration preconfig
    v-container(v-if="isAdding")
      .headline.mb-3 Name
      v-layout
        v-flex
          v-text-field(
            hide-details single-line
            outline
          )
      .headline.mb-3.mt-4 Select Runtime
      v-layout
        v-flex
          v-select(
            v-model="runtime"
            :items="runtimes"
            :disabled="isLoading"
            item-text="text"
            item-value="runtime"
            hide-details single-line
            outline
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
          outline
        ) Cancel
        v-btn.ma-0(
          :disabled="isLoading"
          :loading="isLoading"
          @click="submit"
          color="primary"
          large outline
        ) Create
</template>

<script>
import { mapState, mapActions } from 'vuex'
import EventBus from '@/lib/eventBus'

export default {
  name: 'IntegrationsIndex',
  data: () => ({
    isAdding: false,
    runtimes: [
      {
        text: 'Node.js',
        runtime: 'nodejs',
        icon: 'mdi-nodejs',
        color: '#43853d'
      },
      {
        text: 'Python',
        runtime: 'python',
        icon: 'mdi-language-python',
        color: '#4180b1'
      },
      {
        text: 'Java',
        runtime: 'java',
        icon: 'mdi-language-java',
        color: '#e11e21'
      },
      {
        text: 'Go',
        runtime: 'go',
        icon: 'mdi-language-go',
        color: '#29beb1'
      },
      {
        text: 'C',
        runtime: 'c',
        icon: 'mdi-language-c',
        color: '#f7ef21'
      }
    ],
    runtime: 'nodejs'
  }),
  computed: mapState('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Integration', ['create']),
    async submit () {
      this.showSearch = false
      this.setIsLoading(true)
      try {
        await this.create({ runtime: this.runtime })
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
    EventBus.$on('vbox:addIntegration', () => { this.isAdding = true })
  },
  beforeDestroy () {
    EventBus.$off('vbox:addIntegration')
  }
}
</script>

<style lang="stylus" scoped>
.container
  max-width 800px

  .flex
    position relative
</style>
