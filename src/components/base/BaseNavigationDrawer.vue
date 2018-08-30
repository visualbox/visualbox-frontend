<template lang="pug">
v-navigation-drawer(
  app
  v-model="drawer"
  fixed clipped
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
    items: [
      { icon: 'network_check', text: 'Get Started' },
      { icon: 'launch', text: 'Sign In' },
      { divider: true },
      { heading: 'VisualBox' },
      { icon: 'call_merge', text: 'Data Integrations' },
      { icon: 'widgets', text: 'Widgets' },
      { icon: 'web', text: 'Dashboards' },
      { divider: true },
      { icon: 'settings', text: 'Settings' },
      { icon: 'help', text: 'Help' }
    ]
  })
}
</script>

<style lang="stylus" scoped>
.v-navigation-drawer
  >>> &__border
    display none
</style>
