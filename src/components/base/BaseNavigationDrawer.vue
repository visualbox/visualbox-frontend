<template lang="pug">
v-navigation-drawer(
  app
  v-model="model"
  fixed clipped
  disable-resize-watcher
)
  v-list
    template(v-for="(item, i) in items")
      v-layout(
        v-if="item.heading"
        :key="i"
        row
        align-center
      )
        v-flex(xs6)
          v-subheader(v-if="item.heading") {{ item.heading }}
      v-divider.my-3(
        v-else-if="item.divider"
        :key="i"
        dark
      )
      v-list-tile(
        v-else
        :key="i"
        @click=""
      )
        v-list-tile-action
          v-icon {{ item.icon }}
        v-list-tile-content
          v-list-tile-title.grey--text {{ item.text }}
</template>

<script>
import mapApp from '@/mixins/mapApp'

export default {
  name: 'BaseNavigationDrawer',
  mixins: [ mapApp ],
  data: () => ({
    model: false,
    items: [
      { icon: 'network_check', text: 'Get Started' },
      { divider: true },
      { heading: 'VisualBox' },
      { icon: 'widgets', text: 'Features' },
      { icon: 'help', text: 'FAQ' },
      { divider: true },
      { icon: 'launch', text: 'Sign In' }
    ]
  }),
  watch: {
    drawer () {
      this.model = true
    }
  }
}
</script>

<style lang="stylus" scoped>
.v-navigation-drawer
  >>> &__border
    display none
</style>
