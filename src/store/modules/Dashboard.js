import Vue from 'vue'
import * as t from '@/store/types'
import API from '@/service/API'
import { mergeDeep, cloneDeep } from '@/lib/utils'
import { DashboardHandler } from '@/service'

const state = {
  list: [],
  loaded: null,
  initedIntegrations: [],

  explorer: {
    type: 'INTEGRATION',
    local: true
  },

  isEditing: false,
  isFullscreen: false,
  isExploring: false,
  focusedWidget: null,
  focusedIntegration: null,

  integrationConfigMap: {},
  widgetConfigMap: {},
  widgetSourceMap: {}
}

const mutations = {
  [t.DASHBOARD_RESET] (state) {
    state.list = []
    state.loaded = null
    state.initedIntegrations = []

    state.explorer = {
      type: 'INTEGRATION',
      local: true
    },

    state.isEditing = false
    state.isFullscreen = false
    state.isExploring = false
    state.focusedWidget = null
    state.focusedIntegration = null,

    state.integrationConfigMap = {}
    state.widgetConfigMap = {}
    state.widgetSourceMap = {}
  },

  //------------ META
  [t.DASHBOARD_SET_EDITING] (state, payload) {
    state.isEditing = payload
  },
  [t.DASHBOARD_SET_FULLSCREEN] (state, payload) {
    state.isFullscreen = payload
  },
  [t.DASHBOARD_SET_EXPLORER] (state, { explorer, isExploring }) {
    state.explorer = explorer
    state.isExploring = isExploring
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
  [t.DASHBOARD_ADD_INITED_INTEGRATION] (state, i) {
    const index = state.initedIntegrations.length
    Vue.set(state.initedIntegrations, index, i)
  },
  [t.DASHBOARD_REMOVE_INITED_INTEGRATION] (state, i) {
    const index = state.initedIntegrations.findIndex(e => e === i)

    if (index >= 0)
      state.initedIntegrations.splice(index, 1)
  },
  [t.DASHBOARD_ADD_INTEGRATION] (state, integration) {
    const index = state.loaded.integrations.length
    Vue.set(state.loaded.integrations, index, integration)
  },
  [t.DASHBOARD_REMOVE_INTEGRATION] (state, i) {
    const index = state.loaded.integrations.findIndex(a => a.i === i)
    Vue.delete(state.loaded.integrations, index)
  },
  [t.DASHBOARD_ADD_WIDGET] (state, widget) {
    const index = state.loaded.widgets.length
    Vue.set(state.loaded.widgets, index, widget)
  },
  [t.DASHBOARD_REMOVE_WIDGET] (state, i) {
    const index = state.loaded.widgets.findIndex(w => w.i === i)

    // Unfocus if currently focused
    if (state.focusedWidget === i)
      state.focusedWidget = null

    Vue.delete(state.loaded.widgets, index)
  },
  [t.DASHBOARD_CONCAT_FOCUSED] (state, { focused, payload }) {
    focused = mergeDeep(focused, payload)
    state.loaded = cloneDeep(state.loaded)
  },

  //------------ MAPS
  [t.DASHBOARD_SET_I_CONFIG_MAP] (state, payload) {
    state.integrationConfigMap = Object.assign(state.integrationConfigMap, payload)
  },
  [t.DASHBOARD_REMOVE_I_CONFIG_MAP] (state, hash) {
    Vue.delete(state.integrationConfigMap, hash)
  },
  [t.DASHBOARD_SET_W_CONFIG_MAP] (state, payload) {
    state.widgetConfigMap = Object.assign(state.widgetConfigMap, payload)
  },
  [t.DASHBOARD_SET_W_SOURCE_MAP] (state, payload) {
    state.widgetSourceMap = Object.assign(state.widgetSourceMap, payload)
  },
  [t.DASHBOARD_REMOVE_W_MAP] (state, hash) {
    Vue.delete(state.widgetConfigMap, hash)
    Vue.delete(state.widgetSourceMap, hash)
  }
}

const actions = {
  async list ({ commit }) {
    let integrationConfigMap = {}
    let widgetConfigMap = {}
    let widgetSourceMap = {}
    let list = []

    try {
      const result = await API.invoke('get', '/dashboard')
      integrationConfigMap = result.integrationConfigMap
      widgetConfigMap = result.widgetConfigMap
      widgetSourceMap = result.widgetSourceMap
      list = result.list
    } catch (e) {
      throw e
    } finally {
      commit(t.DASHBOARD_SET_I_CONFIG_MAP, integrationConfigMap)
      commit(t.DASHBOARD_SET_W_CONFIG_MAP, widgetConfigMap)
      commit(t.DASHBOARD_SET_W_SOURCE_MAP, widgetSourceMap)
      commit(t.DASHBOARD_SET_LIST, list)
    }
  },
  async create ({ commit }) {
    let result = []

    try {
      result.push(await API.invoke('post', '/dashboard'))
    } catch (e) {
      throw e
    } finally {
      commit(t.DASHBOARD_CONCAT_LIST, result)
    }
  },
  async del ({ commit }, id) {
    commit(t.DASHBOARD_DELETE_LIST, id)

    try {
      await API.invoke('del', `/dashboard/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },

  // -----------------------------------------------------
  openExplorer ({ commit }, type) {
    commit(t.DASHBOARD_SET_EXPLORER, {
      explorer: {
        type,
        local: true
      },
      isExploring: true
    })
  },
  closeExplorer ({ commit }) {
    commit(t.DASHBOARD_SET_EXPLORER, {
      explorer: {
        type: null,
        local: true
      },
      isExploring: false
    })
  },

  /**
   * Load a dashboard by making a copy and
   * calling Integration/Widget cleaning so that
   * non-existing local Integrations/Widgets gets removed.
   */
  load ({ commit, getters, state }, id) {
    const dashboard = getters.dashboardById(id)
    commit(t.DASHBOARD_SET_LOADED, dashboard)

    DashboardHandler.initDashboard()
  },

  /**
   * Commit loaded dashboard to list.
   * Push dashboard to API.
   */
  async commit ({ commit, dispatch, state }, unload = false) {
    try {
      commit(t.DASHBOARD_COMMIT_LOADED)
      const loaded = cloneDeep(state.loaded)

      // Unload dashboard, we are exiting
      if (unload) {
        commit(t.DASHBOARD_SET_LOADED, null)
        commit(t.DASHBOARD_SET_FOCUSED_WIDGET, null)
        commit(t.DASHBOARD_SET_FOCUSED_INTEGRATION, null)
        dispatch('closeExplorer')
        DashboardHandler.end();
      }

      const { id } = loaded
      await API.invoke('put', `/dashboard/${id}`, { body: loaded })
    } catch (e) {
      throw e
    }
  },

  /**
   * Add an integration by fetching the required
   * config.json file from the registry. Local
   * integrations are also fetched by this method
   * but this can be improved to fetch from local
   * list instead (giving instant feedback).
   */
  async addIntegration ({ commit, dispatch, state }, { id, version }) {
    try {
      const endpoint = `/dashboard/${state.loaded.id}/integration`
      const {
        item,
        integrationConfigMap
      } = await API.invoke('post', endpoint, {
        body: {
          type: 'ADD',
          id, version
        }
      })
      commit(t.DASHBOARD_SET_I_CONFIG_MAP, integrationConfigMap)

      // Apply defaults to widget model
      item.model = await dispatch('applyDefaults', { type: 'INTEGRATION', item })

      commit(t.DASHBOARD_ADD_INTEGRATION, item)

      DashboardHandler.addIntegration(item)
    } catch (e) {
      console.log('Error', e)
    }
  },

  /**
   * When the user deletes an integration from
   * the list, send a ping to the container telling
   * it to stop the process.
   */
  async removeIntegration ({ commit, state }, { i, id, version }) {
    try {
      commit(t.DASHBOARD_REMOVE_INTEGRATION, i)
      commit(t.DASHBOARD_REMOVE_INITED_INTEGRATION, i)

      // Cleanup integration config map
      const index = state.loaded.integrations.findIndex(i => {
        return i.id === id && i.version === version
      })
      if (index < 0)
        commit(t.DASHBOARD_REMOVE_I_CONFIG_MAP, `${id}:${version}`)

      DashboardHandler.removeIntegration(i)
    } catch (e) {
      console.log('Error', e)
    }
  },

  /**
   * When the user changes the intergation
   * configuration, send a ping to the container
   * telling it to restart the process with the
   * provided configuraiton object.
   */
  updateFocusedIntegration ({ commit, getters }, payload = {}) {
    const focused = getters.focusedIntegration
    if (focused === null)
      return

    commit(t.DASHBOARD_CONCAT_FOCUSED, { focused, payload })

    const { i, id, version, model } = focused
    DashboardHandler.restartIntegration({ i, id, version, model })
  },

  /**
   * Add widget by fetching the required
   * config.json file from the registry. Local
   * widgets are also fetched by this method
   * but this can be improved to fetch from local
   * list instead (giving instant feedback).
   * Additionaly: the source code (index.html) is
   * fetched from registry and stored in separate
   * dashboard widget_id:version map (to avoid
   * duplicate sources).
   */
  async addWidget ({ commit, dispatch, state }, { id, version }) {
    try {
      const endpoint = `/dashboard/${state.loaded.id}/widget`
      let {
        item,
        widgetConfigMap,
        widgetSourceMap
      } = await API.invoke('post', endpoint, {
        body: {
          type: 'ADD',
          id, version
        }
      })
      commit(t.DASHBOARD_SET_W_CONFIG_MAP, widgetConfigMap)
      commit(t.DASHBOARD_SET_W_SOURCE_MAP, widgetSourceMap)

      // Apply defaults to widget model
      item.model = await dispatch('applyDefaults', { type: 'WIDGET', item })

      commit(t.DASHBOARD_ADD_WIDGET, item)
    } catch (e) {
      console.log('Error', e)
    }
  },

  /**
   * When the user deletes a widget from
   * the list, send a ping to the container
   * telling it to stop the process.
   */
  async removeWidget ({ commit, state }, { i, id, version }) {
    try {
      commit(t.DASHBOARD_REMOVE_WIDGET, i)

      // Cleanup widget config map
      const index = state.loaded.widgets.findIndex(i => {
        return i.id === id && i.version === version
      })
      if (index < 0)
        commit(t.DASHBOARD_REMOVE_W_MAP, `${id}:${version}`)
    } catch (e) {
      console.log('Error', e)
    }
  },

  updateFocusedWidget ({ commit, getters }, payload = {}) {
    const focused = getters.focusedWidget
    if (focused === null)
      return

    commit(t.DASHBOARD_CONCAT_FOCUSED, { focused, payload })
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

    let widget = cloneDeep(originalWidget)
    widget.i = ni
    commit(t.DASHBOARD_ADD_WIDGET, widget)
  },

  applyDefaults ({ state, rootGetters }, { type, item }) {
    const { id, version } = item
    let config, configMap, configMapById

    if (type === 'WIDGET') {
      configMap = state.widgetConfigMap
      configMapById = rootGetters['Widget/configMapById']
    } else {
      configMap = state.integrationConfigMap
      configMapById = rootGetters['Integration/configMapById']
    }

    // Local, fetch from store
    if (version === '^') {
      config = configMapById(id)

      // Something went wrong retieving local config map
      if (!config || typeof config === 'string')
        config = []

    // Registry, fetch from config map
    } else {
      const hash = `${id}:${version}`
      config = configMap[hash]
    }

    const defaults = config.reduce((acc, cur) => {
      acc[cur.name] = cur.default || null
      return acc
    }, {})

    return defaults
  }
}

const getters = {
  dashboardById: ({ list }) => id => {
    return list.find(i => i.id === id) || null
  },
  focusedIntegration ({ loaded, focusedIntegration }) {
    if (loaded === null || focusedIntegration === null)
      return null

    return loaded.integrations.find(({ i }) => i === focusedIntegration) || null
  },
  focusedWidget ({ loaded, focusedWidget }) {
    if (loaded === null || focusedWidget === null)
      return null

    return loaded.widgets.find(({ i }) => i === focusedWidget) || null
  },

  /**
   * Used by data tree when converting
   * top level 'i' to user-defined integration
   * name.
   */
  integrationByI: ({ loaded }) => i => {
    return loaded.integrations.find(addedIntegration => addedIntegration.i === i) || null
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
