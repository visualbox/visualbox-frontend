import * as _ from 'lodash'
import * as t from '@/store/types'
import API from '@/service/API'
import { difference, mergeDeep, cloneDeep } from '@/lib/utils'

/**
 * Parse the version and name from a string.
 * @param  {String} str Package name
 * @return {Array}      [name, version] array
 */
const getVersionName = str => {
  const [ a, b, c ] = str.split('@')

  // Name starts with '@' (e.g. @angular/core)
  if (str.charAt(0) === '@')
    return [ `@${b}`, c ]
  else
    return [ a, b ]
}

/**
 * Return a cloned object of an integration package.
 * @param {Object}  state Vuex state object
 * @return {Object}       Integration apckage object
 */
const getPkg = state => {
  let pkg = cloneDeep(_.get(state, 'loaded.package', {}))
  if (!pkg.hasOwnProperty('dependencies'))
    pkg.dependencies = {}
  return pkg
}

const state = {
  list: [],
  public: [],
  loaded: null,
  tab: 0,
  showHelper: false,
  layoutHelper: 'horizontal'
}

const mutations = {
  [t.INTEGRATION_RESET] (state) {
    state.list = []
    state.public = []
    state.loaded = null
    state.tab = 0
    state.showHelper = false
    state.layoutHelper = 'horizontal'
  },
  [t.INTEGRATION_SET_TAB] (state, payload) {
    state.tab = payload
  },
  [t.INTEGRATION_SET_HELPER] (state, payload) {
    state.showHelper = !!payload
  },
  [t.INTEGRATION_SET_HELPER_LAYOUT] (state, payload) {
    state.layoutHelper = payload
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
  [t.INTEGRATION_SET_LOADED] (state, payload) {
    state.loaded = cloneDeep(payload)
  },
  [t.INTEGRATION_CONCAT_LOADED] (state, payload) {
    let merged = mergeDeep(state.loaded, payload)

    /**
     * Package needs to be replaced since
     * deep merge & diff won't handle deletion.
     */
    if (payload.hasOwnProperty('package'))
      merged.package = payload.package

    /**
     * Package needs to be replaced since
     * deep merge & diff won't handle deletion.
     */
    if (payload.hasOwnProperty('resDependencies'))
      merged.resDependencies = payload.resDependencies

    state.loaded = cloneDeep(merged)
  },
  [t.INTEGRATION_COMMIT_LOADED] (state, nullify = false) {
    const { loaded } = state
    let index = state.list.findIndex(i => i.id === loaded.id)
    state.list[index] = cloneDeep(loaded)
    state.list = cloneDeep(state.list)

    // Used when closing / exiting 'loaded'
    if (nullify)
      state.loaded = null
  },
  [t.INTEGRATION_CLEAN_DASHBOARD] (state, integrations) {
    // Remove every integration that does not exist in list
    integrations.forEach(i => {
      const index = state.list.findIndex(a => a.id === i.id)
      if (index < 0)
        integrations.splice(index, 1)
    })
  },
  [t.INTEGRATION_SET_PUBLIC] (state, payload) {
    // Try to find existing
    const index = state.public.findIndex(item => item.id === payload.id)

    if (index < 0)
      state.public.push(payload)
    else
      state.public[index] = cloneDeep(payload)
    state.public = cloneDeep(state.public)
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
  async create ({ commit }, id = null) {
    let result = [] // Default value

    try {
      result.push(await API.invoke('post', '/integration', {
        body: { id }
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
  // Load an integration by making a local copy
  load ({ commit, getters }, id) {
    commit(t.INTEGRATION_SET_LOADED, getters.integrationById(id))
  },
  // Update a loaded local integration
  updateLoaded ({ commit }, payload = {}) {
    payload.updatedAt = +new Date()
    commit(t.INTEGRATION_CONCAT_LOADED, payload)
  },
  async closeLoaded ({ commit, dispatch, state, getters }) {
    dispatch('updateLoaded') // To add timestamp
    try {
      const { id } = state.loaded
      const diff = cloneDeep(getters.loadedDiff)
      commit(t.INTEGRATION_COMMIT_LOADED, true) // Must come before API call
      await API.invoke('put', `/integration/${id}`, { body: diff })
    } catch (e) {
      throw e
    }
  },
  // Commit a loaded local integration
  async commitLoaded ({ commit, state, getters }) {
    try {
      await API.invoke('put', `/integration/${state.loaded.id}`, { body: getters.loadedDiff })
      commit(t.INTEGRATION_COMMIT_LOADED)
    } catch (e) {
      throw e
    }
  },
  async loadPublic ({ commit }, id) {
    let result = null // Default value

    try {
      result = await API.invoke('get', `/integration/${id}`)
    } catch (e) {
      throw e
    } finally {
      commit(t.INTEGRATION_SET_PUBLIC, result)
    }
  },
  async resolveDependency ({ dispatch, state }, { action, list }) {
    if (!list || list.length === 0)
      return
    action = action === 'ADD' ? 'ADD' : 'REMOVE'

    const addDependencies = deps => {
      let pkg = getPkg(state)
      for (let i in deps) {
        let { name, version } = deps[i]
        version = typeof version === 'undefined' ? '*' : version
        pkg.dependencies[name] = version
      }
      dispatch('updateLoaded', { package: pkg })
    }

    const addResDependencies = resDependencies => {
      dispatch('updateLoaded', { resDependencies })
    }

    const removeDependencies = deps => {
      let pkg = getPkg(state)
      for (let i in deps) {
        const name = deps[i]
        if (pkg.dependencies.hasOwnProperty(name))
          delete pkg.dependencies[name]
      }
      dispatch('updateLoaded', { package: pkg })
    }

    try {
      // Parse string name and version
      const newDeps = list.map(d => {
        let [ name, version ] = getVersionName(d)
        return { name, version }
      })

      if (action === 'ADD')
        addDependencies(newDeps)
      else
        removeDependencies(newDeps.map(d => d.name))

      // Resolve dependency list
      let pkg = getPkg(state)
      const res = await API.invoke('post', '/resolver', {
        body: pkg.dependencies
      })

      // Parse error and revert accordingly
      if (res.error) {
        const { error } = res

        switch (error) {
          case 'PACKAGE_NOT_FOUND':
            removeDependencies([ res.data.name ])
            break
          case 'UNSATISFIED_RANGE':
            removeDependencies([ res.data.name ])
            break
          case 'MISSING_PEERS':
            const peers = Object.keys(res.data).map(name => {
              const requester = Object.keys(res.data[name])[0]
              const version = res.data[name][requester]

              // Add resolved requester dep
              const [ rname, rversion ] = getVersionName(requester)
              addDependencies([{
                name: rname,
                version: rversion
              }])

              return `${name}@${version}`
            })

            // Recursively add peer
            await dispatch('resolveDependency', {
              action: 'ADD',
              list: peers
            })
            break
          // Undo
          default:
            if (action === 'ADD')
              removeDependencies(newDeps.map(d => d.name))
            else
              addDependencies(newDeps)
        }
      // OK
      } else {
        const { appDependencies, resDependencies } = res
        const deps = Object.keys(appDependencies).map(name => {
          const version = appDependencies[name].version
          return { name, version }
        })
        const resDeps = Object.keys(resDependencies)
        console.log(resDeps)
        addDependencies(deps)
        addResDependencies(resDeps)
      }
    } catch (e) {
      console.log(e)
    }
  }
}

const getters = {
  /**
   * Get an integration by ID.
   */
  integrationById: ({ list }) => id => {
    return list.find(i => i.id === id)
  },

  /**
   * Return diff between loaded and old item in list
   */
  loadedDiff ({ loaded }, getters) {
    try {
      let diff = difference(loaded, getters.integrationById(loaded.id))

      /**
       * If package is in diff, meaning it has been changed,
       * copy it in its entirety so that deletions are handled
       * correctly.
       */
      if (diff.hasOwnProperty('package'))
        diff.package = cloneDeep(loaded.package)
      if (diff.hasOwnProperty('resDependencies'))
        diff.resDependencies = cloneDeep(loaded.resDependencies)

      return diff
    } catch (e) {
      return {}
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
