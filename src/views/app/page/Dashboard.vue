<template lang="pug">
#dashboard.pa-3(v-if="loaded !== null && typeof loaded !== 'undefined'")
  #slate.elevation-5
    span foo
</template>

<script>
import * as _ from 'lodash'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: mapGetters('Dashboard', ['loaded']),
  methods: mapActions('Dashboard', ['load']),
  mounted () {
    this.load(this.$route.params.id)
  }
}
</script>

<style lang="stylus" scoped>
#dashboard
  height 100%

  #slate
    height 100%
    background #FFF
</style>
