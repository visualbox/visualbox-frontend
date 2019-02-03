<template lang="pug">
editor(v-if="ready")
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { Editor } from '@/components'
import { HelperIntegration } from '@/components/helper'

export default {
  name: 'Integration',
  components: {
    Editor,
    HelperIntegration
  },
  computed: mapState('Project', ['ready']),
  methods: {
    ...mapGetters('Integration', ['integrationById']),
    ...mapActions('Project', ['load']),
  },
  mounted () {
    const integration = this.integrationById()(this.$route.params.id)
    this.load(integration)
  }
}
</script>

<style lang="stylus" scoped>
</style>
