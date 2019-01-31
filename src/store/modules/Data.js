import Vue from 'vue'
import * as t from '@/store/types'
import { dataTree } from '@/lib/utils'

const state = {
  data: {}
}

const mutations = {
  [t.DATA_RESET] (state) {
    state.data = {}
  },
  [t.DATA_SET_DATA] (state, { i, data }) {
    Vue.set(state.data, i, data)
  },
  [t.DATA_CLEAN_DATA] (state, is) {
    is.forEach(i => {
      delete state.data[i]
    })
  }
}

const actions = {
}

const getters = {
  dataTree ({ data }, getters, rootState, rootGetters) {
    let dt = dataTree(data)

    // Convert top-leved ID's into integration names
    for (let i in dt) {
      try {
        let integration = dt[i]
        const { key } = integration
        integration.text = rootGetters['Dashboard/integrationByI'](key).settings.label || key
      } catch (e) {
        continue
      }
    }
    return dt
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
