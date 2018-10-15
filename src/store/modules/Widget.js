import * as _ from 'lodash'
import * as t from '@/store/types'
import { API } from 'aws-amplify'
import config from '@/config'
import difference from '@/lib/difference'

const state = {
  list: [],
  loaded: null
}

const mutations = {
  [t.WIDGET_SET_LIST] (state, payload) {
    state.list = _.cloneDeep(payload)
  },
  [t.WIDGET_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.WIDGET_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },
  [t.WIDGET_SET_LOADED] (state, payload) {
    state.loaded = _.cloneDeep(payload)
  },
  [t.WIDGET_CONCAT_LOADED] (state, payload) {
    state.loaded = Object.assign(state.loaded, payload)
  },
  [t.WIDGET_COMMIT_LOADED] (state) {
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
      result = await API.get(config.env, '/widget')
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_SET_LIST, result)
    }
  },
  async create ({ commit }) {
    let result = [] // Default value

    try {
      result.push(await API.post(config.env, '/widget'))
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_CONCAT_LIST, result)
    }
  },
  async del ({ commit }, id) {
    // Immediately remove widget from local app
    commit(t.WIDGET_DELETE_LIST, id)

    try {
      await API.del(config.env, `/widget/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },
  // Load a widget by making a local copy
  load ({ commit, getters }, id) {
    commit(t.WIDGET_SET_LOADED, getters.widgetById(id))
  },
  // Update a loaded local widget
  updateLoaded ({ commit, dispatch }, payload) {
    payload.updatedAt = +new Date()
    commit(t.WIDGET_CONCAT_LOADED, payload)

    dispatch('commitLoaded')
  },
  // Commit a loaded local widget
  async commitLoaded ({ commit, getters }) {
    try {
      await API.put(config.env, `/widget/${getters.loaded.id}`, { body: getters.loadedDiff })
      commit(t.WIDGET_COMMIT_LOADED)
    } catch (e) {
      throw e
    } finally {}
  }
}

const getters = {
  list (state) {
    return state.list
  },
  widgetById: state => id => {
    return state.list.find(i => i.id === id)
  },
  loaded (state) {
    return state.loaded
  },
  // Return diff between loaded and old item in list
  loadedDiff (state, getters) {
    try {
      const loaded = state.loaded
      return difference(loaded, getters.widgetById(loaded.id))
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
