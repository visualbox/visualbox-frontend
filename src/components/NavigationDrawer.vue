<template lang="pug">
#navigation-drawer
  v-navigation-drawer(
    mini-variant
    permanent
    floating
    fixed
  )
    v-layout(column fill-height)
      v-list(two-line)
        tooltip(
          v-for="item in items"
          :key="item.title"
          :text="item.title"
          right
        )
          v-list-item(
            :to="item.to"
            :href="item.href"
            :target="item.href ? '_new' : ''"
            :exact="item.to === '/app'"
            :ripple="false"
          )
            v-list-item-action
              v-icon(
                :color="item.color"
                medium
              ) {{ item.icon }}
      v-spacer
      v-list(two-line)
        tooltip(
          v-for="item in itemsBottom"
          :key="item.title"
          :text="item.title"
          right
        )
          v-list-item(
            :to="item.to"
            :href="item.href"
            :target="item.href ? '_new' : ''"
            :exact="item.to === '/app'"
            :ripple="false"
          )
            v-list-item-action
              v-icon(
                :color="item.color"
                medium
              ) {{ item.icon }}

  #context
    v-scroll-x-transition(mode="out-in")
      router-view(name="context")
</template>

<script lang="ts">
import Vue from 'vue'
import { Tooltip } from '@/components'

export default Vue.extend({
  name: 'NavigationDrawer',
  components: { Tooltip },
  data: () => ({
    items: [
      { title: 'Dashboards', to: '/app/d', icon: 'mdi-panorama-wide-angle' },
      { title: 'Manage Integrations', to: '/app/i', icon: 'mdi-source-fork' },
      { title: 'Manage Widgets', to: '/app/w', icon: 'mdi-hexagon-multiple' },
      // { title: 'Artificial Intelligence', to: '/app/ml', icon: 'mdi-brain' },
      { title: 'Help', href: 'https://docs.visualbox.io', icon: 'mdi-help-circle' }
    ],
    itemsBottom: [
      // { title: 'GitHub', to: '/app/gh', icon: 'mdi-github-circle' },
      { title: 'Discord', href: 'https://discord.gg/VVnJmqh', icon: 'mdi-discord' },
      { title: 'Settings', to: '/app/s', icon: 'mdi-cog' },
      { title: 'Logout', to: '/app/signout', icon: 'mdi-power-standby' }
    ]
  })
})
</script>

<style lang="stylus" scoped>
@import '../styles/colors';

#navigation-drawer
  height 100%
  position relative

  // Mini-drawer styles
  .v-navigation-drawer
    width 60px !important
    top 0; bottom 0;
    background-color $vb-drawer-mini !important

    >>> .v-list
      padding 0

      .v-list-item
        height 56px
        -webkit-transition none !important
        transition none !important

        &--active
          background $vb-primary !important

        &--link
          .v-icon
            color $vb-drawer-icon !important

          &:before
            background-color unset !important

        &--link:hover, &--active
          .v-icon
            color $vb-drawer-icon-hoveractive !important

        .v-list-item__action
          min-width 20px

          .v-icon
            font-size 28px

  // Context global styles
  #context
    background-color $vb-drawer-ctx !important
    position absolute
    top 0; right 0; bottom 0; left 60px;

    > div
      background-color $vb-drawer-ctx

    >>> .v-list
      padding 0
      background unset

      .v-list-item
        &:before
          background-color unset !important
          -webkit-transition none !important
          transition none !important

        &:hover
          background-color $vb-primary-list-hover

        &--active, &--active:hover
          background-color $vb-primary-list-active !important

      .active
        .v-icon, .v-list__tile__content
          color unset

        .v-list__tile, .v-list__tile:hover
          background-color $vb-primary-list-active !important

      .v-list-item__subtitle
        font-weight 400 !important

      .v-list-item__action
        min-width 18px
        margin 8px 0

    // Color picker
    >>> .v-expansion-panel, .v-expansion-panel__container
      border-radius 4px
      overflow hidden

    // Outline input
    >>> .v-text-field--outline
      &.primary--text, .primary--text
        color #FFF !important
        caret-color #FFF  !important

      .v-input__slot
        border 1px solid rgba(255, 255, 255, .5)

        &:hover
          border 1px solid rgba(255, 255, 255, 1)

      &.v-input--is-focused, &.v-input--has-state
        & > .v-input__control > .v-input__slot
          border 1px solid rgba(255, 255, 255, 1)
</style>
