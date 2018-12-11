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
          :exact="item.to === '/app'"
        )
          v-list-tile-action
            v-icon(
              :color="item.color"
              medium
            ) {{ item.icon }}
  .context
    v-scroll-x-transition(mode="out-in")
      router-view(name="context")
  </template>

<script>
export default {
  name: 'AppNavigationDrawer',
  data: () => ({
    items: [
      { title: 'Dashboards', to: '/app/d', icon: 'mdi-panorama-wide-angle' },
      { title: 'Manage Integrations', to: '/app/i', icon: 'mdi-source-fork' },
      { title: 'Manage Widgets', to: '/app/w', icon: 'mdi-hexagon-multiple' },
      { title: 'Help Center', to: '/app/h', icon: 'mdi-help-circle' },
      { title: 'Settings', to: '/app/s', icon: 'mdi-settings', class: 'bottom_upper' },
      { title: 'Logout', to: '/app/signout', icon: 'mdi-power-standby', class: 'bottom' }
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

      // Left border
      &:before
        content ''
        display block
        position absolute
        top 0
        right 0
        bottom 0
        left 0
        border-left 0 solid #FFF

  .bottom_upper
    position absolute
    bottom 72px

  .bottom
    position absolute
    bottom 0

  .context
    height 100%
    margin-left 80px
    background-color #272727 !important

  &.theme--light
    .v-navigation-drawer--mini-variant
      background-color #444

      >>> .v-list__tile
        &--active
          .v-icon
            color #FFF !important

    >>> .v-list__tile
        &--link
          .v-icon
            color #9e9e9e !important

        &--active
          .v-icon
            color #747474 !important

    .context
      background-color #f5f5f5 !important
</style>
