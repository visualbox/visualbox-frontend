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
  [t.DASHBOARD_SET_CREATE] (state, payload) {
    // TODO
  }
}

const actions = {
  async list ({ commit }, payload) {
    let result = [] // Default value

    try {
      result = await API.get(config.env, '/dashboard/list')
    } catch (e) {
      throw e
    } finally {
      commit(t.DASHBOARD_SET_LIST, result)
    }
  },
  async create ({ commit }, payload) {
    let result = null // Default value

    try {
      result = await API.post(config.env, '/dashboard/create')
      // TODO
    } catch (e) {
      throw e
    } finally {
      commit(t.DASHBOARD_SET_CREATE, result)
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
