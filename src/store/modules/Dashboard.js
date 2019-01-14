import * as _ from 'lodash'
import * as t from '@/store/types'
import API from '@aws-amplify/api'
import config from '@/config'
import difference from '@/lib/difference'
import mergeDeep from '@/lib/mergeDeep'
import cloneDeep from '@/lib/cloneDeep'
import parseConfig from '@/lib/parseConfig'

const state = {
  list: [],
  loaded: null,
  isEditing: false,
  isFullscreen: false,
  isAddingIntegration: false,
  focusedWidget: null,
  focusedIntegration: null
}

const mutations = {
  [t.DASHBOARD_RESET] (state) {
    state.list = []
    state.loaded = null
    state.isEditing = false
    state.isFullscreen = false
    state.isAddingIntegration = false
    state.focusedWidget = null
    state.focusedIntegration = null
  },
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
  [t.DASHBOARD_SET_ADDING_INTEGRATION] (state, payload) {
    state.isAddingIntegration = payload
  },
  [t.DASHBOARD_SET_FOCUSED_WIDGET] (state, payload) {
    state.focusedWidget = payload
  },
  [t.DASHBOARD_SET_FOCUSED_INTEGRATION] (state, payload) {
    state.focusedIntegration = payload
  },
  [t.DASHBOARD_CONCAT_FOCUSED] (state, { focused, payload }) {
    focused = mergeDeep(focused, payload)
    state.loaded = _.cloneDeep(state.loaded)
  },
  [t.DASHBOARD_REMOVE_WIDGET] (state) {
    const index = state.loaded.widgets.findIndex(w => w.i === state.focusedWidget)
    state.focusedWidget = null
    state.loaded.widgets.splice(index, 1)
    state.loaded = _.cloneDeep(state.loaded)
  },
  [t.DASHBOARD_ADD_WIDGET] (state, widget) {
    state.loaded.widgets.push(widget)
    state.loaded = _.cloneDeep(state.loaded)
  },
  [t.DASHBOARD_ADD_INTEGRATION] (state, integration) {
    state.loaded.integrations.push(integration)
    state.loaded = _.cloneDeep(state.loaded)
  },
  [t.DASHBOARD_REMOVE_INTEGRATION] (state, i) {
    const index = state.loaded.integrations.findIndex(addedIntegration => addedIntegration.i === i)
    state.loaded.integrations.splice(index, 1)
    state.loaded = _.cloneDeep(state.loaded)
  }
}

const actions = {
  async list ({ commit }) {
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
    let dashboard = getters.dashboardById(id)
    commit(`Integration/${t.INTEGRATION_CLEAN_DASHBOARD}`, dashboard.integrations, { root: true })
    commit(`Widget/${t.WIDGET_CLEAN_DASHBOARD}`, dashboard.widgets, { root: true })
    commit(t.DASHBOARD_SET_LOADED, dashboard)
  },
  // Update a loaded local dashboard
  updateLoaded ({ commit, dispatch }, payload = {}) {
    payload.updatedAt = +new Date()
    commit(t.DASHBOARD_CONCAT_LOADED, payload)
  },
  async closeLoaded ({ commit, dispatch, state, getters }) {
    dispatch('updateLoaded') // To add timestamp
    try {
      const { id } = state.loaded
      const diff = cloneDeep(getters.loadedDiff)
      commit(t.DASHBOARD_COMMIT_LOADED, true) // Must come before API call
      commit(t.DASHBOARD_SET_ADDING_INTEGRATION, false) // Close potentially open adding integration
      commit(t.DASHBOARD_SET_FOCUSED_WIDGET, null) // Close potentially open focused widget
      commit(t.DASHBOARD_SET_FOCUSED_INTEGRATION, null) // Close potentially open focused integration
      await API.put(config.env, `/dashboard/${id}`, { body: diff })
    } catch (e) {
      throw e
    }
  },
  // Commit a loaded local dashboard
  async commitLoaded ({ commit, state, getters }) {
    try {
      await API.put(config.env, `/dashboard/${state.loaded.id}`, { body: getters.loadedDiff })
      commit(t.DASHBOARD_COMMIT_LOADED)
    } catch (e) {
      throw e
    }
  },
  updateFocusedWidget ({ commit, getters }, payload = {}) {
    const focused = getters.focusedWidget

    if (focused === null)
      return

    commit(t.DASHBOARD_CONCAT_FOCUSED, { focused, payload })
  },
  updateFocusedIntegration ({ commit, getters }, payload = {}) {
    const focused = getters.focusedIntegration

    if (focused === null)
      return

    commit(t.DASHBOARD_CONCAT_FOCUSED, { focused, payload })
  },
  /**
   * Made as an action so that we can get
   * widget configuration defaults.
   */
  addWidget ({ commit, rootGetters }, id) {
    // Generate widget ID
    let n = 0
    let i = `_${n}`
    while (typeof state.loaded.widgets.find(w => w.i === i) !== 'undefined') {
      n++
      i = `_${n}`
    }

    // Fetch widget config
    const w = rootGetters['Widget/widgetById'](id)
    const config = parseConfig(w.config)
    // Create default config model
    const defaultConfig = config.variables.reduce((acc, cur) => {
      acc[cur.name] = cur.default || null
      return acc
    }, {})

    const widget = {
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      i,
      id,
      settings: {
        source: null,
        config: defaultConfig,
        rgba: {
          r: 255,
          g: 255,
          b: 255,
          a: 1
        }
      }
    }
    commit(t.DASHBOARD_ADD_WIDGET, widget)
  },
  /**
   * Made as an action since we need to return
   * the integration, so that we can register
   * in in WorkerHandler.
   */
  addIntegration ({ commit, state }, { id, settings }) {
    // Generate integration ID
    let n = 0
    let i = `_${n}`
    while (typeof state.loaded.integrations.find(a => a.i === i) !== 'undefined') {
      n++
      i = `_${n}`
    }
    const integration = { i, id, settings }
    commit(t.DASHBOARD_ADD_INTEGRATION, integration)
    return integration
  }
}

const getters = {
  dashboardById: ({ list }) => id => {
    return list.find(i => i.id === id)
  },
  integrationByI: ({ loaded }) => i => {
    return loaded.integrations.find(addedIntegration => addedIntegration.i === i)
  },
  // Return diff between loaded and old item in list
  loadedDiff ({ loaded }, { dashboardById }) {
    try {
      let diff = difference(loaded, dashboardById(loaded.id))
      diff.integrations = loaded.integrations // Cannot take diff on integrations
      diff.widgets = loaded.widgets // Cannot take diff on widgets
      return diff
    } catch (e) {
      return {}
    }
  },
  focusedWidget ({ loaded, focusedWidget }) {
    if (focusedWidget === null)
      return null

    try {
      return loaded.widgets.find(w => w.i === focusedWidget)
    } catch (e) {
      return null
    }
  },
  focusedIntegration ({ loaded, focusedIntegration }) {
    if (focusedIntegration === null)
      return null

    try {
      return loaded.integrations.find(a => a.i === focusedIntegration)
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
