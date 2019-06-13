import Vue from 'vue'
import JSZip from 'jszip'
import * as t from '@/store/types'
import get from 'lodash-es/get'
import isObject from 'lodash-es/isObject'
import { cloneDeep, parseConfig } from '@/lib/utils'
import { Zip } from '@/service'

const parseSettings = (opts = {}) => {
  const settings = get(opts, 'settings', null)
  return !settings ? {} : cloneDeep(settings)
}

const parseVersions = (opts = {}) => {
  const versions = get(opts, 'versions', null)
  return !versions ? false : cloneDeep(versions)
}

const state = {
  ready: false,
  showInfo: true,
  showSettings: false,
  showImport: false,
  showHelper: false,
  layoutHelper: 'horizontal',

  id: null,
  uid: null,
  type: null,
  fileTree: [],
  settings: {},
  versions: {},

  active: null,
  open: new Set(),
  dirty: new Set(),
  peek: null
}

const mutations = {
  [t.PROJECT_RESET] (state) {
    state.ready = false

    state.showInfo = true
    state.showSettings = false
    state.showImport = false
    state.showHelper = false
    state.layoutHelper = 'horizontal'

    state.id = null
    state.uid = null
    state.type = null
    state.fileTree = []
    state.settings = {}
    state.versions = {}

    state.active = null
    state.open.clear()
    state.dirty.clear()
    state.peek = null

    Zip.reset()
  },
  [t.PROJECT_SET_LOADED] (state, { type, project }) {
    const copy = cloneDeep(project)

    state.id = copy.id
    state.uid = copy.uid
    state.type = type
    state.settings = parseSettings(copy)
    state.versions = parseVersions(copy)
    state.ready = true
  },
  [t.PROJECT_UPDATE_FILE_TREE] (state) {
    state.fileTree = Zip.fileTree
  },
  [t.PROJECT_SET_SETTINGS] (state, { key, value }) {
    Vue.set(state.settings, key, value)
  },
  [t.PROJECT_SET_VERSIONS] (state, { id, versions }) {
    if (id === state.id)
      state.versions = versions
  },
  [t.PROJECT_SAVE] (state) {
    state.dirty = new Set()
  },
  [t.PROJECT_SHOW_INFO] (state) {
    state.showInfo = true
    state.showSettings = false
    state.showImport = false
  },
  [t.PROJECT_SHOW_SETTINGS] (state) {
    state.showInfo = false
    state.showSettings = true
    state.showImport = false
  },
  [t.PROJECT_SHOW_IMPORT] (state) {
    state.showInfo = false
    state.showSettings = false
    state.showImport = true
  },
  [t.PROJECT_SHOW_HELPER] (state, payload) {
    state.showHelper = !!payload
  },
  [t.PROJECT_SET_HELPER_LAYOUT] (state, payload) {
    state.layoutHelper = payload
  },
  [t.PROJECT_ADD_OPEN] (state, payload) {
    state.open.add(payload)
    state.open = new Set(state.open)

    // Adding to open, ergo no longer peek
    if (state.peek === payload)
      state.peek = null
  },
  [t.PROJECT_CLOSE_OPEN] (state, payload) {
    state.open.delete(payload)
    state.open = new Set(state.open)

    // Was peeking, close
    if (state.peek === payload)
      state.peek = null

    // Find new active
    if (state.active === payload) {
      state.active = state.open.size <= 0
                     ? null
                     : [...state.open][state.open.size - 1]
    }
  },
  [t.PROJECT_SET_PEEK] (state, payload) {
    // Cannot be peek if already open
    if (!state.open.has(payload))
      state.peek = payload
    state.active = payload

    // Disable open info/settings
    state.showInfo = false
    state.showSettings = false
    state.showImport = false
  },
  [t.PROJECT_SET_ACTIVE] (state, payload) {
    state.active = payload

    // Disable open info/settings
    state.showInfo = false
    state.showSettings = false
    state.showImport = false
  },
  [t.PROJECT_TOUCH_FILE] (state, name) {
    state.dirty.add(name)
    state.dirty = new Set(state.dirty)

    if (name === state.peek) {
      state.peek = null
      state.open.add(name)
      state.open = new Set(state.open)
    }
  },
  [t.PROJECT_RENAME_FILE] (state, { name, newName }) {
    // Handle dirty state
    state.dirty.delete(name)
    state.dirty.add(newName)
    state.dirty = new Set(state.dirty)
  },
  [t.PROJECT_RENAME_FOLDER] (state, { name, newName }) {
    const len = name.length

    // Basically swap out old prefix everywhere
    if (state.peek && state.peek.substring(0, len) === name)
      state.peek = newName + state.peek.substring(len)
    if (state.active && state.active.substring(0, len) === name)
      state.active = newName + state.active.substring(len)
    state.open.forEach(open => {
      if (open.substring(0, len) === name) {
        state.open.delete(open)
        state.open.add(newName + open.substring(len))
      }
    })
    state.dirty.forEach(dirty => {
      if (dirty.substring(0, len) === name) {
        state.dirty.delete(dirty)
        state.dirty.add(newName + dirty.substring(len))
      }
    })
    state.open = new Set(state.open)
  }
}

const actions = {
  async load ({ commit }, { type, project, signedUrl }) {
    commit(t.PROJECT_RESET)

    if (!signedUrl)
      throw new Error('Unable to load files')

    /**
     * Fetch ZIP from signedUrl.
     */
    try {
      const result = await fetch(signedUrl)
      const blob = await result.blob()
      Zip.reset(await JSZip.loadAsync(blob))
      commit(t.PROJECT_UPDATE_FILE_TREE)
      commit(t.PROJECT_SET_LOADED, { type, project })
    } catch (e) {
      throw e
    }
  },

  async import ({ commit }, file) {
    try {
      Zip.reset(await JSZip.loadAsync(file))
      commit(t.PROJECT_UPDATE_FILE_TREE)
    } catch (e) {
      throw e
    }
  },

  async renameFile ({ commit }, { name, newName }) {
    try {
      newName = await Zip.renameFile({ name, newName })
      commit(t.PROJECT_UPDATE_FILE_TREE)
      commit(t.PROJECT_CLOSE_OPEN, name)
      commit(t.PROJECT_ADD_OPEN, newName)
      commit(t.PROJECT_SET_ACTIVE, newName)
      commit(t.PROJECT_RENAME_FILE, { name, newName })
    } catch (e) {
      console.log(e)
    }
  },

  async renameFolder ({ commit }, { name, newName }) {
    try {
      newName = await Zip.renameFolder({ name, newName })
      commit(t.PROJECT_RENAME_FOLDER, { name, newName })
      commit(t.PROJECT_UPDATE_FILE_TREE)

      // Used to swap openTree in EditorCtx
      return { name, newName }

    } catch (e) {
      console.log(e)
    }
  },

  /**
   * Return project metadata for
   * integration/widget to save in API.
   */
  save ({ state }) {
    const { id, settings, versions } = state
    return { id, settings, versions }
  },

  /**
   * Return ID and ZIP blob for
   * integration/widget to save in API.
   */
  async saveFiles ({ commit, state }) {
    commit(t.PROJECT_SAVE)

    try {
      const { id } = state
      const blob = await Zip.getBlob()

      return { id, blob }
    } catch (e) {
      throw e
    }
  }
}

const getters = {
  /**
   * Return the registry version of the project.
   * 0  - not been published before
   * -1 - published but later removed
   * >0 - latest version
   */
  registryVersion: ({ versions }) => {
    if (!isObject(versions))
      return -1
    
    const keys = Object.keys(versions)
    return (keys.length <= 0)
      ? 0
      : Math.max(...keys)
  },

  /**
   * Retrieve parsed config map for current project.
   * Make use if type to determine which Vuex module
   * to fetch from.
   */
  parsedConfigMap: ({ type, id }, getters, rootState, rootGetters) => {
    if (type !== 'INTEGRATION' && type !== 'WIDGET') {
      return {
        error: [`Invalid project type '${type}'`],
        variables: []
      }
    }

    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    const configMap = rootGetters[`${capitalizedType}/configMapById`](id)

    // Something went wrong retieving local config map
    if (!configMap || typeof configMap === 'string') {
      const error = !configMap ? 'Unable to get config.json' : configMap
      return {
        error: [error],
        variables: []
      }
    }

    return parseConfig(configMap)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
