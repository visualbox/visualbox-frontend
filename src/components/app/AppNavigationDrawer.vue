<template lang="pug">
v-navigation-drawer(
  app
  hide-overlay
  stateless
  permanent
  floating
  width="380"
)
  v-navigation-drawer(
    app
    mini-variant
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
          :to="item.to"
          exact
        )
          v-list-tile-action
            v-icon(
              :color="item.color"
              medium
            ) {{ item.icon }}
  v-layout.context(fill-height)
    router-view
  </template>

<script>
export default {
  name: 'AppNavigationDrawer',
  data: () => ({
    items: [
      { title: 'Dashboards', to: '/app', icon: 'panorama_wide_angle' },
      { title: 'Integrations', to: '/app/i', icon: 'device_hub' },
      { title: 'Widgets', to: '/app/w', icon: 'widgets' },
      { title: 'Settings', to: '/app/s', icon: 'settings' },
      { title: 'Logout', to: '/auth/signout', icon: 'power_settings_new', class: 'bottom' }
    ]
  })
}
</script>

<style lang="stylus" scoped>
.v-navigation-drawer
  .bottom
    position absolute
    bottom 0

  .context
    margin-left 80px
    background-color #272727 !important
</style>
