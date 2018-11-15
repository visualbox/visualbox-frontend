import * as _ from 'lodash'
import * as t from '@/store/types'
import { API } from 'aws-amplify'
import config from '@/config'
import difference from '@/lib/difference'
import mergeDeep from '@/lib/mergeDeep'
import cloneDeep from '@/lib/cloneDeep'

const state = {
  list: [],
  loaded: null
}

const mutations = {
  [t.WIDGET_RESET] (state) {
    state.list = []
    state.loaded = null
  },
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
    state.loaded = mergeDeep(state.loaded, payload)
    state.loaded = _.cloneDeep(state.loaded)
  },
  [t.WIDGET_COMMIT_LOADED] (state, nullify = false) {
    const { loaded } = state
    let index = state.list.findIndex(i => i.id === loaded.id)
    state.list[index] = _.cloneDeep(loaded)
    state.list = _.cloneDeep(state.list)

    // Used when closing / exiting 'loaded'
    if (nullify)
      state.loaded = null
  },
  [t.WIDGET_CLEAN_DASHBOARD] (state, widgets) {
    // Remove every integration that does not exist in list
    widgets.forEach(w => {
      const index = state.list.findIndex(a => a.id === w.id)
      if (index < 0)
        widgets.splice(index, 1)
    })
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
  updateLoaded ({ commit, dispatch }, payload = {}) {
    payload.updatedAt = +new Date()
    commit(t.WIDGET_CONCAT_LOADED, payload)
  },
  async closeLoaded ({ commit, dispatch, getters }) {
    dispatch('updateLoaded') // To add timestamp
    try {
      const id = getters.loaded.id
      const diff = cloneDeep(getters.loadedDiff)
      commit(t.WIDGET_COMMIT_LOADED, true) // Must come before API call
      await API.put(config.env, `/widget/${id}`, { body: diff })
    } catch (e) {
      throw e
    }
  },
  // Commit a loaded local widget
  async commitLoaded ({ commit, getters }) {
    try {
      await API.put(config.env, `/widget/${getters.loaded.id}`, { body: getters.loadedDiff })
      commit(t.WIDGET_COMMIT_LOADED)
    } catch (e) {
      throw e
    }
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
