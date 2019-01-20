<template lang="pug">
v-navigation-drawer(
  hide-overlay
  stateless
  permanent
  floating
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
@import '../../assets/styles/colors';

.v-navigation-drawer
  width unset !important
  transition none !important
  -webkit-transition none !important
  overflow-x unset !important
  overflow-y unset !important

  >>> .v-list__tile
    -webkit-transition unset !important
    transition unset !important

  .v-navigation-drawer--mini-variant
    background-color $vb-drawer-mini

    >>> .v-list__tile
      &:hover
        background unset

      &--active
        background $vb-primary !important

      &--link
        .v-icon
          color $vb-drawer-icon !important

      &--link:hover, &--active
        .v-icon
          color $vb-drawer-icon-hoveractive !important

  .bottom_upper
    position absolute
    bottom 72px

  .bottom
    position absolute
    bottom 0

  .context
    height 100%
    margin-left 80px
    background-color $vb-drawer-ctx !important
    border-right 1px solid $vb-drawer-ctx-border
    overflow auto

    >>> .v-list
      padding 0

      .v-list__tile--link:hover
        background-color $vb-primary-list-hover

        &:before
          content ''
          width 2px
          height 100%
          position absolute
          left 1px
          background $vb-primary

      .v-list__tile__action
        min-width 30px

    >>> .v-expansion-panel, .v-expansion-panel__container
      border-radius 4px
      overflow hidden
</style>
