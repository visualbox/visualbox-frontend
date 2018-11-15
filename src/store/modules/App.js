import * as _ from 'lodash'
import * as t from '@/store/types'

const set = property => (store, payload) => (store[property] = payload)

const state = {
  sessionIsReady: false,
  appIsReady: false,
  isLoading: false,
  snackbar: {}
}

const mutations = {
  [t.APP_RESET] (state) {
  },
  [t.APP_SET_SESSION_IS_READY]: set('sessionIsReady'),
  [t.APP_SET_APP_IS_READY]: set('appIsReady'),
  [t.APP_SET_IS_LOADING]: set('isLoading'),
  [t.APP_SET_SNACKBAR] (state, payload) {
    state.snackbar = _.clone(payload)
  }
}

const actions = {
  setIsLoading ({ commit }, payload) {
    commit(t.APP_SET_IS_LOADING, payload)
  },
  setSnackbar ({ commit }, payload) {
    commit(t.APP_SET_SNACKBAR, payload)
  },
  async initSession ({ commit, dispatch }) {
    try {
      await dispatch('Cognito/fetchSession', null, { root: true })
    } catch (e) {
      throw e
    } finally {
      commit(t.APP_SET_SESSION_IS_READY, true)
    }
  },
  async initApp ({ commit, dispatch }) {
    try {
      await Promise.all([
        dispatch('Dashboard/list', null, { root: true }),
        dispatch('Widget/list', null, { root: true }),
        dispatch('Integration/list', null, { root: true })
      ])
    } catch (e) {
      throw e
    } finally {
      commit(t.APP_SET_APP_IS_READY, true)
    }
  },
  reset ({ commit }) {
    commit(t.APP_RESET)
    commit(`Dashboard/${t.DASHBOARD_RESET}`, null, { root: true })
    commit(`Widget/${t.WIDGET_RESET}`, null, { root: true })
    commit(`Integration/${t.INTEGRATION_RESET}`, null, { root: true })
    commit(`Data/${t.DATA_RESET}`, null, { root: true })
  }
}

const getters = {
  sessionIsReady (state) {
    return state.sessionIsReady
  },
  appIsReady (state) {
    return state.appIsReady
  },
  isLoading (state) {
    return state.isLoading
  },
  snackbar (state) {
    return state.snackbar
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
