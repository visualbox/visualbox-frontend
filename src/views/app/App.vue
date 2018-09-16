<template lang="pug">
#app
  app-navigation-drawer
  span CONTENT
</template>

<script>
import { API } from 'aws-amplify'
import unauthGuard from '@/mixins/unauthGuard'
import AppNavigationDrawer from '@/components/app/AppNavigationDrawer'

export default {
  name: 'App',
  mixins: [ unauthGuard ],
  components: { AppNavigationDrawer },
  async mounted () {
    try {
      const result = await API.get('default', '/dashboard/list')
      console.log('SUCCESS', result)
    } catch (e) {
      console.error(e)
    }
  }
}
</script>
