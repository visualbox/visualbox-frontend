import * as t from '@/store/types'
import API from '@/service/API'
import { difference, mergeDeep, cloneDeep } from '@/lib/utils'

const state = {
  list: [],
  public: []
}

const mutations = {
  [t.INTEGRATION_RESET] (state) {
    state.list = []
    state.public = []
  },
  [t.INTEGRATION_SET_LIST] (state, payload) {
    state.list = cloneDeep(payload)
  },
  [t.INTEGRATION_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.INTEGRATION_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },
  [t.INTEGRATION_CONCAT_LOADED] (state, payload) {
    let merged = mergeDeep(state.loaded, payload)

    /**
     * Package needs to be replaced since
     * deep merge & diff won't handle deletion.
     */
    if (payload.hasOwnProperty('package'))
      merged.package = payload.package

    /**
     * Package needs to be replaced since
     * deep merge & diff won't handle deletion.
     */
    if (payload.hasOwnProperty('resDependencies'))
      merged.resDependencies = payload.resDependencies

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
      result = await API.invoke('get', '/integration')
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_SET_LIST, result)
    }
  },
  async create ({ commit }, id = null) {
    let result = [] // Default value

    try {
      result.push(await API.invoke('post', '/integration', {
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
      await API.invoke('del', `/integration/${id}`)
    } catch (e) {
      throw e
    } finally {}
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
      await API.invoke('put', `/integration/${id}`, { body: diff })
    } catch (e) {
      throw e
    }
  },
  // Commit a loaded local integration
  async commitLoaded ({ commit, state, getters }) {
    try {
      await API.invoke('put', `/integration/${state.loaded.id}`, { body: getters.loadedDiff })
      commit(t.INTEGRATION_COMMIT_LOADED)
    } catch (e) {
      throw e
    }
  },
  async loadPublic ({ commit }, id) {
    let result = null // Default value

    try {
      result = await API.invoke('get', `/integration/${id}`)
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
      if (diff.hasOwnProperty('resDependencies'))
        diff.resDependencies = cloneDeep(loaded.resDependencies)

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
