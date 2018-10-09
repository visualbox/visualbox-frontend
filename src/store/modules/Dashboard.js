import * as _ from 'lodash'
import * as t from '@/store/types'
import { API } from 'aws-amplify'
import config from '@/config'

const state = {
  list: []
}

const mutations = {
  [t.DASHBOARD_SET_LIST] (state, payload) {
    state.list = _.clone(payload)
  },
  [t.DASHBOARD_CONCAT_LIST] (state, payload) {
    state.list = state.list.concat(payload)
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
  }
}

const getters = {
  list (state) {
    return state.list
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
