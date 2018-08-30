import * as t from '@/store/types'

const state = {
  isReady: false,
  snackbar: {},
  drawer: false
}

const mutations = {
  [t.APP_SET_IS_READY] (state, payload) {
    state.isReady = payload
  },
  [t.APP_SET_SNACKBAR] (state, payload) {
    state.snackbar = payload
  },
  [t.APP_SET_DRAWER] (state, payload) {
    state.drawer = payload
  }
}

const actions = {
  setIsReady ({ commit }, payload) {
    commit(t.APP_SET_IS_READY, payload)
  },
  setSnackbar ({ commit }, payload) {
    commit(t.APP_SET_SNACKBAR, payload)
  },
  setDrawer ({ commit }, payload) {
    commit(t.APP_SET_DRAWER, payload)
  }
}

const getters = {
  isReady (state) {
    return state.isReady
  },
  snackbar (state) {
    return state.snackbar
  },
  drawer (state) {
    return state.drawer
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
