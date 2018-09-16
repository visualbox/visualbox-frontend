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
        color="black"
        transition="fade-transition"
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
  .context
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
  >>> .v-list__tile
    &--link
      .v-icon
        color rgba(255, 255, 255, .5) !important

    &--active
      .v-icon
        color #FFF !important

      &:before
        content ''
        display block
        position absolute
        top 0
        right 0
        bottom 0
        left 0
        border-left 0 solid #FFF

  .bottom
    position absolute
    bottom 0

  .context
    height 100%
    margin-left 80px
    background-color #272727 !important
</style>
