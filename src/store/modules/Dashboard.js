import * as _ from 'lodash'
import * as t from '@/store/types'
import { API } from 'aws-amplify'
import config from '@/config'
import difference from '@/lib/difference'
import mergeDeep from '@/lib/mergeDeep'
import cloneDeep from '@/lib/cloneDeep'

const state = {
  list: [],
  loaded: null,
  isEditing: false,
  isFullscreen: false,
  focusedWidget: null
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
  [t.DASHBOARD_COMMIT_LOADED] (state, nullify = false) {
    const { loaded } = state
    let index = state.list.findIndex(i => i.id === loaded.id)
    state.list[index] = _.cloneDeep(loaded)
    state.list = _.cloneDeep(state.list)

    // Used when closing / exiting 'loaded'
    if (nullify)
      state.loaded = null
  },
  [t.DASHBOARD_SET_EDITING] (state, payload) {
    state.isEditing = payload
  },
  [t.DASHBOARD_SET_FULLSCREEN] (state, payload) {
    state.isFullscreen = payload
  },
  [t.DASHBOARD_SET_FOCUSED] (state, payload) {
    state.focusedWidget = payload
  },
  [t.DASHBOARD_CONCAT_FOCUSED] (state, { focused, payload }) {
    focused = mergeDeep(focused, payload)
    console.log(focused)
  },
  [t.DASHBOARD_ADD_WIDGET] (state, id) {
    // Generate widget ID
    let n = 0
    let i = `_${n}`
    while (typeof state.loaded.widgets.find(w => w.i === i) !== 'undefined') {
      n++
      i = `_${n}`
    }

    state.loaded.widgets.push({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      i,
      id,
      config: {
        variables: {},
        rgba: {
          r: 255,
          g: 255,
          b: 255,
          a: 1
        }
      }
    })
    state.loaded = _.cloneDeep(state.loaded)
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
  updateLoaded ({ commit, dispatch }, payload = {}) {
    payload.updatedAt = +new Date()
    commit(t.DASHBOARD_CONCAT_LOADED, payload)
  },
  async closeLoaded ({ commit, dispatch, getters }) {
    dispatch('updateLoaded') // To add timestamp
    try {
      const id = getters.loaded.id
      const diff = cloneDeep(getters.loadedDiff)
      commit(t.DASHBOARD_COMMIT_LOADED, true) // Must come before API call
      await API.put(config.env, `/dashboard/${id}`, { body: diff })
    } catch (e) {
      throw e
    }
  },
  // Commit a loaded local dashboard
  async commitLoaded ({ commit, getters }) {
    try {
      await API.put(config.env, `/dashboard/${getters.loaded.id}`, { body: getters.loadedDiff })
      commit(t.DASHBOARD_COMMIT_LOADED)
    } catch (e) {
      throw e
    }
  },
  updateFocused ({ commit, getters }, payload = {}) {
    const focused = getters.focusedWidget

    if (focused === null)
      return

    commit(t.DASHBOARD_CONCAT_FOCUSED, { focused, payload })
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
      let diff = difference(loaded, getters.dashboardById(loaded.id))
      diff.widgets = loaded.widgets // Cannot take diff on widgets
      return diff
    } catch (e) {
      return {}
    }
  },
  focusedWidget (state) {
    if (state.focusedWidget === null)
      return null

    try {
      return state.loaded.widgets.find(w => w.i === state.focusedWidget)
    } catch (e) {
      return null
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
