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
  [t.INTEGRATION_RESET] (state) {
    state.list = []
    state.public = null
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
  [t.INTEGRATION_COMMIT] (state, project) {
    const index = state.list.findIndex(({ id }) => id === project.id)
    if (index >= 0)
      Vue.set(state.list, index, project)
  },
  [t.INTEGRATION_CLEAN_DASHBOARD] (state, integrations) {
    // Remove every integration that does not exist in list
    integrations.forEach(i => {
      const index = state.list.findIndex(a => a.id === i.id)
      if (index < 0)
        integrations.splice(index, 1)
    })
  },
  [t.INTEGRATION_SET_VERSIONS] (state, payload) {
    const index = state.list.findIndex(({ id }) => id === payload.id)
    if (index >= 0)
      Vue.set(state.list[index], 'versions', payload.versions)
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
  async create ({ commit }, { id = null, name = 'Untitled', runtime = 'nodejs' }) {
    let result = [] // Default value

    try {
      result.push(await API.invoke('post', '/integration', {
        body: { id, name, runtime }
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

  async commit ({ commit }, project) {
    try {
      commit(t.INTEGRATION_COMMIT, project)

      /**
       * Update local integration config map.
       * Use version '*' since it's local.
       */
      try {
        commit(`Dashboard/${t.DASHBOARD_SET_I_CONFIG_MAP}`, {
          [`${project.id}:*`]: JSON.parse(project.files['config.json'].contents)
        }, { root: true })
      } catch (e) {}

      const { id } = project
      await API.invoke('put', `/integration/${id}`, { body: project })
    } catch (e) {
      throw e
    }
  },

  async publish ({ commit }, id) {
    try {
      const { versions } = await API.invoke('post', '/registry', {
        body: { type: 'INTEGRATION', id }
      })
      commit(t.INTEGRATION_SET_VERSIONS, { id, versions })
      commit(`Project/${t.PROJECT_SET_VERSIONS}`, { id, versions }, { root: true })
    } catch (e) {
      throw e
    }
  },

  async depublish ({ commit }, id) {
    try {
      await API.invoke('del', '/registry', {
        body: { type: 'INTEGRATION', id }
      })
      commit(t.INTEGRATION_SET_VERSIONS, { id, versions: false })
      commit(`Project/${t.PROJECT_SET_VERSIONS}`, { id, versions: false }, { root: true })
    } catch (e) {
      throw e
    }
  }
}

const getters = {
  /**
   * Get an integration by ID.
   */
  integrationById: ({ list }) => id => {
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
