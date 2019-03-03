import Vue from 'vue'
import * as t from '@/store/types'
import get from 'lodash-es/get'
import API from '@/service/API'
import { fileContents } from '@/lib/utils/projectUtils'
import { cloneDeep, parseConfig } from '@/lib/utils'

const state = {
  list: [],
  public: null
}

const mutations = {
  [t.WIDGET_RESET] (state) {
    state.list = []
    state.public = null
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
  [t.WIDGET_COMMIT] (state, project) {
    const index = state.list.findIndex(({ id }) => id === project.id)
    if (index >= 0)
      Vue.set(state.list, index, project)
  },
  [t.WIDGET_CLEAN_DASHBOARD] (state, widgets) {
    // Remove every widget that does not exist in list
    widgets.forEach(w => {
      const index = state.list.findIndex(a => a.id === w.id)
      if (index < 0)
        widgets.splice(index, 1)
    })
  },
  [t.WIDGET_SET_VERSIONS] (state, payload) {
    const index = state.list.findIndex(({ id }) => id === payload.id)
    if (index >= 0)
      Vue.set(state.list[index], 'versions', payload.versions)
  }
}

const actions = {
  async list ({ commit }) {
    let result = [] // Default value

    try {
      result = await API.invoke('get', '/widget')
    } catch (e) {
      throw e
    } finally {
      commit(t.WIDGET_SET_LIST, result)
    }
  },
  async create ({ commit }, { id = null, name = 'Untitled', runtime = 'javascript' }) {
    let result = [] // Default value

    try {
      result.push(await API.invoke('post', '/widget', {
        body: { id, name, runtime }
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
      await API.invoke('del', `/widget/${id}`)
    } catch (e) {
      throw e
    } finally {}
  },

  async commit ({ commit }, project) {
    try {
      commit(t.WIDGET_COMMIT, project)

      /**
       * Update local widget config and source map.
       * Use version '*' since it's local.
       */
      try {
        commit(`Dashboard/${t.DASHBOARD_SET_W_CONFIG_MAP}`, {
          [`${project.id}:*`]: JSON.parse(project.files['config.json'].contents)
        }, { root: true })
        commit(`Dashboard/${t.DASHBOARD_SET_W_SOURCE_MAP}`, {
          [`${project.id}:*`]: project.files['index.html'].contents
        }, { root: true })
      } catch (e) {}

      const { id } = project
      await API.invoke('put', `/widget/${id}`, { body: project })
    } catch (e) {
      throw e
    }
  },

  async publish ({ commit }, id) {
    try {
      const { versions } = await API.invoke('post', '/registry', {
        body: { type: 'WIDGET', id }
      })
      commit(t.WIDGET_SET_VERSIONS, { id, versions })
      commit(`Project/${t.PROJECT_SET_VERSIONS}`, { id, versions }, { root: true })
    } catch (e) {
      throw e
    }
  },

  async depublish ({ commit }, id) {
    try {
      await API.invoke('del', '/registry', {
        body: { type: 'WIDGET', id }
      })
      commit(t.WIDGET_SET_VERSIONS, { id, versions: false })
      commit(`Project/${t.PROJECT_SET_VERSIONS}`, { id, versions: false }, { root: true })
    } catch (e) {
      throw e
    }
  }
}

const getters = {
  /**
   * Get a widget by ID.
   */
  widgetById: ({ list }) => id => {
    return list.find(i => i.id === id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
