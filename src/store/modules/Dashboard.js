import * as _ from 'lodash'
import * as t from '@/store/types'
import { API } from 'aws-amplify'
import config from '@/config'
import difference from '@/lib/difference'
import mergeDeep from '@/lib/mergeDeep'

const state = {
  list: [],
  loaded: null
}

const mutations = {
  [t.DASHBOARD_SET_LIST] (state, payload) {
    state.list = _.clone(payload)
  },
  [t.DASHBOARD_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.DASHBOARD_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },
  [t.DASHBOARD_SET_LOADED] (state, payload) {
    state.loaded = _.cloneDeep(payload)
  },
  [t.DASHBOARD_CONCAT_LOADED] (state, payload) {
    state.loaded = mergeDeep(state.loaded, payload)
    state.loaded = _.cloneDeep(state.loaded)
  },
  [t.DASHBOARD_COMMIT_LOADED] (state) {
    const { loaded } = state
    let index = state.list.findIndex(i => i.id === loaded.id)
    state.list[index] = _.cloneDeep(loaded)
    state.list = _.cloneDeep(state.list)
  }
}

const actions = {
  async list ({ commit }, payload) {
    let result = [] // Default value

    try {
      result = await API.get(config.env, '/dashboard')
    } catch (e) {
      throw e
    } finally {
      commit(t.DASHBOARD_SET_LIST, result)
    }
  },
  async create ({ commit }) {
    let result = [] // Default value

    try {
      result.push(await API.post(config.env, '/dashboard'))
    } catch (e) {
      throw e
    } finally {
      commit(t.DASHBOARD_CONCAT_LIST, result)
    }
  },
  async del ({ commit }, id) {
    // Immediately remove dashboard from local app
    commit(t.DASHBOARD_DELETE_LIST, id)

    try {
      await API.del(config.env, `/dashboard/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },
  // Load a dashboard by making a local copy
  load ({ commit, getters }, id) {
    commit(t.DASHBOARD_SET_LOADED, getters.dashboardById(id))
  },
  // Update a loaded local dashboard
  updateLoaded ({ commit, dispatch }, payload) {
    payload.updatedAt = +new Date()
    commit(t.DASHBOARD_CONCAT_LOADED, payload)
  },
  // Commit a loaded local dashboard
  async commitLoaded ({ commit, getters }) {
    try {
      await API.put(config.env, `/dashboard/${getters.loaded.id}`, { body: getters.loadedDiff })
      commit(t.DASHBOARD_COMMIT_LOADED)
    } catch (e) {
      throw e
    } finally {}
  }
}

const getters = {
  list (state) {
    return state.list
  },
  dashboardById: state => id => {
    return state.list.find(i => i.id === id)
  },
  loaded (state) {
    return state.loaded
  },
  // Return diff between loaded and old item in list
  loadedDiff (state, getters) {
    try {
      const loaded = state.loaded
      return difference(loaded, getters.dashboardById(loaded.id))
    } catch (e) {
      return {}
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
