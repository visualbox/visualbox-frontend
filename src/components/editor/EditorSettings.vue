<template lang="pug">
v-container#editor-settings(fill-height)
  v-layout(align-center justify-center)
    v-container
      .headline.mb-3 Name
      v-layout
        v-flex
          v-text-field(
            hide-details single-line
            outline
          )
      .headline.mb-3.mt-4 Runtime
      v-layout
        v-flex
          v-select(
            v-model="runtime"
            :items="runtimes"
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
        v-btn.ma-0(
          @click=""
          color="primary"
          large outline
        ) Save
      .headline.mb-3.mt-4 Publish to Registry
      v-layout
        v-flex
          span.grey--text
           | By publishing to the registry you allow other users to add your code to their dashboards.
           | The registry is versioned so you can safely update your code without breaking dashboards.
      v-layout.mt-4
        v-spacer
        v-btn.ma-0.mr-3(
          @click=""
          color="red"
          large outline
        ) Remove from Registry
        v-btn.ma-0(
          @click=""
          color="primary"
          large outline
        ) Publish
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { fileTypeMeta, cloneDeep } from '@/lib/utils'
import EventBus from '@/lib/eventBus'

export default {
  name: 'EditorSettings',
  data: () => ({
    name: null,
    runtime: 'nodejs',
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
    ]
  }),
  computed: mapState('Project', ['settings']),
  methods: {
    ...mapActions('App', ['setSnackbar']),
    ...mapActions('Project', ['save'])
  }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/styles/colors';

#editor-settings
  max-width 800px
  padding 16px
  position absolute
  top 0; right 0; left 0; bottom 0;
  overflow hidden
</style>
