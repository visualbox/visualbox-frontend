import { mapGetters, mapActions } from 'vuex'

export default {
  computed: mapGetters('App', [
    'isReady',
    'snackbar',
    'drawer'
  ]),
  methods: mapActions('App', [
    'setIsReady',
    'setSnackbar',
    'setDrawer'
  ])
}
