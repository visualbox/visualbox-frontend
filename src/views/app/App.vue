<template lang="pug">
#app
  app-navigation-drawer
  app-context-drawer
  v-content
    span CONTENT
</template>

<script>
import AppNavigationDrawer from '@/components/app/AppNavigationDrawer'
import AppContextDrawer from '@/components/app/AppContextDrawer'

export default {
  name: 'App',
  components: {
    AppNavigationDrawer,
    AppContextDrawer
  }
}
</script>
