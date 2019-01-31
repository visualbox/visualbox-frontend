import * as t from '@/store/types'
import API from '@aws-amplify/api'
import config from '@/config'
import { difference, mergeDeep, cloneDeep } from '@/lib/utils'

const state = {
  list: [],
  public: [],
  loaded: null,
  tab: 0,
  showHelper: false,
  layoutHelper: 'horizontal'
}

const mutations = {
  [t.WIDGET_RESET] (state) {
    state.list = []
    state.public = []
    state.loaded = null
    state.tab = 0
    state.showHelper = false
    state.layoutHelper = 'horizontal'
  },
  [t.WIDGET_SET_TAB] (state, payload) {
    state.tab = payload
  },
  [t.WIDGET_SET_HELPER] (state, payload) {
    state.showHelper = !!payload
  },
  [t.WIDGET_SET_HELPER_LAYOUT] (state, payload) {
    state.layoutHelper = payload
  },
  [t.WIDGET_SET_LIST] (state, payload) {
    state.list = cloneDeep(payload)
  },
  [t.WIDGET_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.WIDGET_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },
  [t.WIDGET_SET_LOADED] (state, payload) {
    state.loaded = cloneDeep(payload)
  },
  [t.WIDGET_CONCAT_LOADED] (state, payload) {
    let merged = mergeDeep(state.loaded, payload)

    /**
     * Package needs to be replaced since
     * deep merge & diff won't handle deletion.
     */
    if (payload.hasOwnProperty('package'))
      merged.package = payload.package

    state.loaded = cloneDeep(merged)
  },
  [t.WIDGET_COMMIT_LOADED] (state, nullify = false) {
    const { loaded } = state
    let index = state.list.findIndex(i => i.id === loaded.id)
    state.list[index] = cloneDeep(loaded)
    state.list = cloneDeep(state.list)

    // Used when closing / exiting 'loaded'
    if (nullify)
      state.loaded = null
  },
  [t.WIDGET_CLEAN_DASHBOARD] (state, widgets) {
    // Remove every widget that does not exist in list
    widgets.forEach(w => {
      const index = state.list.findIndex(a => a.id === w.id)
      if (index < 0)
        widgets.splice(index, 1)
    })
  },
  [t.WIDGET_SET_PUBLIC] (state, payload) {
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
      result = await API.get(config.env, '/widget')
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_SET_LIST, result)
    }
  },
  async create ({ commit }, id = null) {
    let result = [] // Default value

    try {
      result.push(await API.post(config.env, '/widget', {
        body: { id }
      }))
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
  updateLoaded ({ commit }, payload = {}) {
    payload.updatedAt = +new Date()
    commit(t.WIDGET_CONCAT_LOADED, payload)
  },
  async closeLoaded ({ commit, dispatch, state, getters }) {
    dispatch('updateLoaded') // To add timestamp
    try {
      const { id } = state.loaded
      const diff = cloneDeep(getters.loadedDiff)
      commit(t.WIDGET_COMMIT_LOADED, true) // Must come before API call
      await API.put(config.env, `/widget/${id}`, { body: diff })
    } catch (e) {
      throw e
    }
  },
  // Commit a loaded local widget
  async commitLoaded ({ commit, state, getters }) {
    try {
      await API.put(config.env, `/widget/${state.loaded.id}`, { body: getters.loadedDiff })
      commit(t.WIDGET_COMMIT_LOADED)
    } catch (e) {
      throw e
    }
  },
  async loadPublic ({ commit }, id) {
    let result = null // Default value

    try {
      result = await API.get(config.env, `/widget/${id}`)
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_SET_PUBLIC, result)
    }
  }
}

const getters = {
  /**
   * Get a widget by ID.
   */
  widgetById: ({ list }) => id => {
    return list.find(i => i.id === id)
  },

  /**
   * Return diff between loaded and old item in list
   */
  loadedDiff ({ loaded }, getters) {
    try {
      let diff = difference(loaded, getters.widgetById(loaded.id))

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
