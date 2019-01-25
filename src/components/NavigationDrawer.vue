<template lang="pug">
#navigation-drawer
  v-navigation-drawer#mini(
    mini-variant
    stateless
    permanent
    floating
  )
    v-layout(column fill-height)
      v-list(two-line)
        v-tooltip(
          v-for="item in items"
          :key="item.title"
          :open-delay="0"
          :close-delay="0"
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
      v-spacer
      v-list(two-line)
        v-tooltip(
          v-for="item in itemsBottom"
          :key="item.title"
          :open-delay="0"
          :close-delay="0"
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

  v-navigation-drawer#context(
    stateless
    permanent
    floating
  )
    v-scroll-x-transition(mode="out-in")
      router-view(name="context")
</template>

<script>
export default {
  name: 'NavigationDrawer',
  data: () => ({
    items: [
      { title: 'Dashboards', to: '/app/d', icon: 'mdi-panorama-wide-angle' },
      { title: 'Manage Integrations', to: '/app/i', icon: 'mdi-source-fork' },
      { title: 'Manage Widgets', to: '/app/w', icon: 'mdi-hexagon-multiple' },
      { title: 'Help Center', to: '/app/h', icon: 'mdi-help-circle' }
    ],
    itemsBottom: [
      { title: 'Settings', to: '/app/s', icon: 'mdi-settings', class: 'bottom_upper' },
      { title: 'Logout', to: '/app/signout', icon: 'mdi-power-standby', class: 'bottom' }
    ]
  })
}
</script>

<style lang="stylus" scoped>
@import '../assets/styles/colors';

#navigation-drawer
  height 100% !important
  position relative

  #mini
    background-color $vb-drawer-mini !important

    >>> .v-list
      padding 0

      .v-list__tile
        -webkit-transition none !important
        transition none !important

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

  #context
    width unset !important
    background-color $vb-drawer-ctx !important
    position absolute
    left 80px
    right 0

    >>> .v-list
      padding 0

      .v-list__tile
        -webkit-transition none !important
        transition none !important

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
