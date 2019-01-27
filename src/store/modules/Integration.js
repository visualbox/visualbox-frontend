import Vue from 'vue'
import * as t from '@/store/types'
import API from '@aws-amplify/api'
import config from '@/config'
import difference from '@/lib/difference'
import mergeDeep from '@/lib/mergeDeep'
import cloneDeep from '@/lib/cloneDeep'

const state = {
  list: [],
  public: [],
  loaded: null,
  tab: 0,
  showHelper: false,
  layoutHelper: 'vertical'
}

const mutations = {
  [t.INTEGRATION_RESET] (state) {
    state.list = []
    state.public = []
    state.loaded = null
    state.tab = 0
    state.showHelper = false
    state.layoutHelper = 'vertical'
  },
  [t.INTEGRATION_SET_TAB] (state, payload) {
    state.tab = payload
  },
  [t.INTEGRATION_SET_HELPER] (state, payload) {
    state.showHelper = !!payload
  },
  [t.INTEGRATION_SET_HELPER_LAYOUT] (state, payload) {
    state.layoutHelper = payload
  },
  [t.INTEGRATION_SET_LIST] (state, payload) {
    Vue.set(state, 'list', payload)
  },
  [t.INTEGRATION_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.INTEGRATION_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },
  [t.INTEGRATION_SET_LOADED] (state, payload) {
    Vue.set(state, 'loaded', payload)
  },
  [t.INTEGRATION_CONCAT_LOADED] (state, payload) {
    let merged = mergeDeep(state.loaded, payload)

    /**
     * Package needs to be replaced since
     * deep merge & diff won't handle deletion.
     */
    if (payload.hasOwnProperty('package'))
      merged.package = payload.package

    state.loaded = cloneDeep(merged)
  },
  [t.INTEGRATION_COMMIT_LOADED] (state, nullify = false) {
    const { loaded } = state
    let index = state.list.findIndex(i => i.id === loaded.id)
    state.list[index] = cloneDeep(loaded)
    state.list = cloneDeep(state.list)

    // Used when closing / exiting 'loaded'
    if (nullify)
      state.loaded = null
  },
  [t.INTEGRATION_CLEAN_DASHBOARD] (state, integrations) {
    // Remove every integration that does not exist in list
    integrations.forEach(i => {
      const index = state.list.findIndex(a => a.id === i.id)
      if (index < 0)
        integrations.splice(index, 1)
    })
  },
  [t.INTEGRATION_SET_PUBLIC] (state, payload) {
    // Try to find existing
    const index = state.public.findIndex(item => item.id === payload.id)

    if (index < 0)
      state.public.push(payload)
    else
      state.public[index] = cloneDeep(payload)
    state.public = cloneDeep(state.public)
  }
}

const actions = {
  async list ({ commit }) {
    let result = [] // Default value

    try {
      result = await API.get(config.env, '/integration')
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_SET_LIST, result)
    }
  },
  async create ({ commit }, id = null) {
    let result = [] // Default value

    try {
      result.push(await API.post(config.env, '/integration', {
        body: { id }
      }))
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_CONCAT_LIST, result)
    }
  },
  async del ({ commit }, id) {
    // Immediately remove integration from local app
    commit(t.INTEGRATION_DELETE_LIST, id)

    try {
      await API.del(config.env, `/integration/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },
  // Load an integration by making a local copy
  load ({ commit, getters }, id) {
    commit(t.INTEGRATION_SET_LOADED, getters.integrationById(id))
  },
  // Update a loaded local integration
  updateLoaded ({ commit }, payload = {}) {
    payload.updatedAt = +new Date()
    commit(t.INTEGRATION_CONCAT_LOADED, payload)
  },
  async closeLoaded ({ commit, dispatch, state, getters }) {
    dispatch('updateLoaded') // To add timestamp
    try {
      const { id } = state.loaded
      const diff = cloneDeep(getters.loadedDiff)
      commit(t.INTEGRATION_COMMIT_LOADED, true) // Must come before API call
      await API.put(config.env, `/integration/${id}`, { body: diff })
    } catch (e) {
      throw e
    }
  },
  // Commit a loaded local integration
  async commitLoaded ({ commit, state, getters }) {
    try {
      await API.put(config.env, `/integration/${state.loaded.id}`, { body: getters.loadedDiff })
      commit(t.INTEGRATION_COMMIT_LOADED)
    } catch (e) {
      throw e
    }
  },
  async loadPublic ({ commit }, id) {
    let result = null // Default value

    try {
      result = await API.get(config.env, `/integration/${id}`)
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_SET_PUBLIC, result)
    }
  }
}

const getters = {
  /**
   * Get an integration by ID.
   */
  integrationById: ({ list }) => id => {
    return list.find(i => i.id === id)
  },

  /**
   * Return diff between loaded and old item in list
   */
  loadedDiff ({ loaded }, getters) {
    try {
      let diff = difference(loaded, getters.integrationById(loaded.id))

      /**
       * If package is in diff, meaning it has been changed,
       * copy it in its entirety so that deletions are handled
       * correctly.
       */
      if (diff.hasOwnProperty('package'))
        diff.package = cloneDeep(loaded.package)

      return diff
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
