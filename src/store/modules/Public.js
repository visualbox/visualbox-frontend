import Vue from 'vue'
import * as t from '@/store/types'
import API from '@/service/API'
import { cloneDeep } from '@/lib/utils'
import { DashboardHandler } from '@/service'

const state = {
  loaded: null,
  widgetSourceMap: {},
  initedIntegrations: []
}

const mutations = {
  [t.PUBLIC_SET_W_SOURCE_MAP] (state, payload) {
    state.widgetSourceMap = Object.assign(state.widgetSourceMap, payload)
  },
  [t.PUBLIC_SET_LOADED] (state, payload) {
    state.loaded = cloneDeep(payload)
  },
  [t.PUBLIC_ADD_INITED_INTEGRATION] (state, i) {
    const index = state.initedIntegrations.length
    Vue.set(state.initedIntegrations, index, i)
  }
}

const actions = {
  async initPublicDashboard ({ commit }, id) {
    try {
      const {
        widgetSourceMap,
        dashboard,
        token
      } = await API.invoke('post', `/dashboard/public`, {
        body: { id }
      }, false)

      commit(t.PUBLIC_SET_W_SOURCE_MAP, widgetSourceMap)
      commit(t.PUBLIC_SET_LOADED, dashboard)

      DashboardHandler.initSocket(token)
    } catch (e) {
      throw e
    }
  }
}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
