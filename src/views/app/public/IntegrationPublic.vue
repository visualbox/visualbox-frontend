<template lang="pug">
#integration-public(v-if="public")
  display-public(type="integration")
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { DisplayPublic } from '@/components'

export default {
  name: 'IntegrationPublic',
  components: { DisplayPublic },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (id) {
        this.tab = 0
        try {
          await this.loadPublic(id)
        } catch (e) {
          this.$router.push('/app/i')
        }
      }
    }
  },
  computed: mapState('Integration', ['public']),
  methods: {
    ...mapMutations('Integration', ['INTEGRATION_SET_PUBLIC']),
    ...mapActions('Integration', ['loadPublic']),
  },
  beforeDestroy () {
    this.INTEGRATION_SET_PUBLIC(null)
  }
}
</script>

<style lang="stylus" scoped>
@import '../../../assets/styles/colors';

#integration-public
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
