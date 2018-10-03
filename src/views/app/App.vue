<template lang="pug">
#app
  app-navigation-drawer
  span CONTENT
</template>

<script>
import unauthGuard from '@/mixins/unauthGuard'
import AppNavigationDrawer from '@/components/app/AppNavigationDrawer'

export default {
  name: 'App',
  mixins: [ unauthGuard ],
  components: { AppNavigationDrawer },
  async mounted () {
    try {
      this.$store.dispatch('Dashboard/list')
    } catch (e) {
      console.error(e)
    }
  }
}
</script>
