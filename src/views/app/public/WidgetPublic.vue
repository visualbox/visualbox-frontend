<template lang="pug">
#widget-public(v-if="public")
  display-public(type="widget")
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { DisplayPublic } from '@/components'

export default {
  name: 'WidgetPublic',
  components: { DisplayPublic },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (id) {
        this.tab = 0
        try {
          await this.loadPublic(id)
        } catch (e) {
          this.$router.push('/app/w')
        }
      }
    }
  },
  computed: mapState('Widget', ['public']),
  methods: {
    ...mapMutations('Widget', ['WIDGET_SET_PUBLIC']),
    ...mapActions('Widget', ['loadPublic']),
  },
  beforeDestroy () {
    this.WIDGET_SET_PUBLIC(null)
  }
}
</script>

<style lang="stylus" scoped>
@import '../../../assets/styles/colors';

#widget-public
  height 100%

  >>> .v-toolbar__content
    padding 0 !important

  .grid-layout
    display grid
    position absolute
    top 48px; right 0; left 0; bottom 0;

    .grid-item
      position relative
      overflow-y auto
      overflow-x hidden

      .display-1
        background $vb-gutter

  .markdown
    padding 16px

  .monaco
    position absolute
    top 0; right 0; left 0; bottom 0;
    overflow hidden

    > div
      height 100%
</style>
