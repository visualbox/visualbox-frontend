import Vue from 'vue'
import get from 'lodash-es/get'
import * as t from '@/store/types'
import API from '@/service/API'
import { fileContents } from '@/lib/utils/projectUtils'
import { mergeDeep, cloneDeep, parseConfig } from '@/lib/utils'

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

  //------------ META
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
    state.focusedIntegration = null
    state.focusedWidget = payload
  },
  [t.DASHBOARD_SET_FOCUSED_INTEGRATION] (state, payload) {
    state.focusedWidget = null
    state.focusedIntegration = payload
  },

  //------------ LIST
  [t.DASHBOARD_SET_LIST] (state, payload) {
    state.list = cloneDeep(payload)
  },
  [t.DASHBOARD_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
  },
  [t.DASHBOARD_DELETE_LIST] (state, id) {
    state.list = state.list.filter(i => i.id !== id)
  },

  //------------ LOADED
  [t.DASHBOARD_SET_LOADED] (state, payload) {
    state.loaded = cloneDeep(payload)
  },
  [t.DASHBOARD_CONCAT_LOADED] (state, payload) {
    state.loaded = mergeDeep(state.loaded, payload)
  },
  [t.DASHBOARD_COMMIT_LOADED] (state) {
    const { loaded } = state
    const index = state.list.findIndex(({ id }) => id === loaded.id)
    if (index >= 0)
      Vue.set(state.list, index, loaded)
  },

  //------------ WIDGET /INTEGRATION
  [t.DASHBOARD_CONCAT_FOCUSED] (state, { focused, payload }) {
    focused = mergeDeep(focused, payload)
    state.loaded = cloneDeep(state.loaded)
  },
  [t.DASHBOARD_ADD_WIDGET] (state, widget) {
    const index = state.loaded.widgets.length
    Vue.set(state.loaded.widgets, index, widget)
  },
  [t.DASHBOARD_ADD_INTEGRATION] (state, integration) {
    const index = state.loaded.integrations.length
    Vue.set(state.loaded.integrations, index, integration)
  },
  [t.DASHBOARD_REMOVE_WIDGET] (state, i) {
    const index = state.loaded.widgets.findIndex(w => w.i === i)

    // Unfocus if currently focused
    if (state.focusedWidget === i)
      state.focusedWidget = null

    Vue.delete(state.loaded.widgets, index)
  },
  [t.DASHBOARD_REMOVE_INTEGRATION] (state, i) {
    const index = state.loaded.integrations.findIndex(a => a.i === i)
    Vue.delete(state.loaded.integrations, index)
  }
}

const actions = {
  async list ({ commit }) {
    let result = [] // Default value

    try {
      result = await API.invoke('get', '/dashboard')
    } catch (e) {
      throw e
    } finally {
      commit(t.DASHBOARD_SET_LIST, result)
    }
  },
  async create ({ commit }) {
    let result = [] // Default value

    try {
      result.push(await API.invoke('post', '/dashboard'))
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
      await API.invoke('del', `/dashboard/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },

  /**
   * Load a dashboard by making a copy and
   * calling Integration/Widget cleaning so that
   * non-existing Integrations/Widgets gets removed.
   */
  load ({ commit, getters }, id) {
    const dashboard = getters.dashboardById(id)
    commit(`Integration/${t.INTEGRATION_CLEAN_DASHBOARD}`, dashboard.integrations, { root: true })
    commit(`Widget/${t.WIDGET_CLEAN_DASHBOARD}`, dashboard.widgets, { root: true })
    commit(t.DASHBOARD_SET_LOADED, dashboard)
  },
  async commit ({ commit, state }, unload = false) {
    try {
      commit(t.DASHBOARD_COMMIT_LOADED)
      const loaded = cloneDeep(state.loaded)

      // Unload dashboard, we are exiting
      if (unload) {
        commit(t.DASHBOARD_SET_LOADED, null)
        commit(t.DASHBOARD_SET_ADDING_INTEGRATION, false)
        commit(t.DASHBOARD_SET_FOCUSED_WIDGET, null)
        commit(t.DASHBOARD_SET_FOCUSED_INTEGRATION, null)
      }

      const { id } = loaded
      await API.invoke('put', `/dashboard/${id}`, { body: loaded })
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
  addWidget ({ commit, state, rootGetters }, id) {
    // Generate widget ID
    let n = 0
    let i = `_${n}`
    while (typeof state.loaded.widgets.find(w => w.i === i) !== 'undefined') {
      n++
      i = `_${n}`
    }

    // Fetch widget config
    const { files } = rootGetters['Widget/widgetById'](id)
    const contents = fileContents(files, ['config.json'])
    if (!contents)
      throw 'Could not add Widget, no config.json in Widget'

    const config = parseConfig(contents)
    // Create default config model
    const defaultConfig = config.variables.reduce((acc, cur) => {
      acc[cur.name] = cur.default || null
      return acc
    }, {})

    const widget = {
      x: 0,
      y: 0,
      w: 6,
      h: 6,
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
   * Same as addWidget() but use existing
   * widget configuration instead.
   */
  copyWidget ({ commit, state, }, i) {
    // Generate widget ID
    let n = 0
    let ni = `_${n}`
    while (typeof state.loaded.widgets.find(w => w.i === ni) !== 'undefined') {
      n++
      ni = `_${n}`
    }

    // Fetch original widget config
    const originalWidget = state.loaded.widgets.find(w => w.i === i)
    if (typeof originalWidget === 'undefined')
      return
    
    const w = get(originalWidget, 'w', null)
    const h = get(originalWidget, 'h', null)
    const id = get(originalWidget, 'id', null)
    const settings = get(originalWidget, 'settings', null)
    if (!w || !h || !id || !settings)
      return
    
    const widget = {
      x: 0,
      y: 0,
      w,
      h,
      i: ni,
      id,
      settings: cloneDeep(settings)
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
    return list.find(i => i.id === id) || null
  },
  integrationByI: ({ loaded }) => i => {
    return loaded.integrations.find(addedIntegration => addedIntegration.i === i) || null
  },
  focusedWidget ({ loaded, focusedWidget }) {
    if (loaded === null || focusedWidget === null)
      return null

    return loaded.widgets.find(({ i }) => i === focusedWidget) || null
  },
  focusedIntegration ({ loaded, focusedIntegration }) {
    if (loaded === null || focusedIntegration === null)
      return null

    return loaded.integrations.find(({ i }) => i === focusedIntegration) || null
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
