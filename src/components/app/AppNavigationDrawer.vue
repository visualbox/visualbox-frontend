<template lang="pug">
v-navigation-drawer(
  app
  mini-variant
  hide-overlay
  stateless
  permanent
  floating
)
  v-list.pa-0(two-line)
    v-tooltip(
      v-for="item in items"
      :key="item.title"
      :open-delay="0"
      :close-delay="0"
      :class="item.class"
      right
    )
      span {{ item.title }}
      v-list-tile(
        slot="activator"
        @click=""
      )
        v-list-tile-action
          v-icon(
            :color="item.color"
            medium
          ) {{ item.icon }}
</template>

<script>
export default {
  name: 'AppNavigationDrawer',
  data: () => ({
    items: [
      { title: 'Dashboards', icon: 'panorama_wide_angle' },
      { title: 'Integrations', icon: 'device_hub' },
      { title: 'Widgets', icon: 'widgets' },
      { title: 'Settings', icon: 'settings' },
      { title: 'Logout', icon: 'power_settings_new', class: 'bottom' }
    ]
  })
}
</script>

<style lang="stylus" scoped>
.v-navigation-drawer
  .bottom
    position absolute
    bottom 0
</style>
