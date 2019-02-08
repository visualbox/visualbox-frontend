import Vue from 'vue'
import * as t from '@/store/types'
import get from 'lodash-es/get'
import { packageJson } from '@/lib/utils/projectUtils'
import {
  cloneDeep,
  filesTree,
  isValidPath,
  pathMeta,
  getUniqueName,
  getFullPath
} from '@/lib/utils'

/*
**
 * Parse the version and name from a string.
 * @param  {String} str Package name
 * @return {Array}      [name, version] array
 *
const getVersionName = str => {
  const [ a, b, c ] = str.split('@')

  // Name starts with '@' (e.g. @angular/core)
  if (str.charAt(0) === '@')
    return [ `@${b}`, c ]
  else
    return [ a, b ]
}

**
 * Return a cloned object of an integration package.
 * @param {Object}  state Vuex state object
 * @return {Object}       Integration apckage object
 *
const getPkg = state => {
  try {
    let pkg = cloneDeep(get(state, ['loaded', 'files', 'package.json'], ''))
    if (!pkg.hasOwnProperty('dependencies'))
      pkg.dependencies = {}
    return pkg
  } catch (e) {
    return null
  }
}
*/

const parseFiles = (opts = {}) => {
  const files = get(opts, 'files', null)
  return !files ? {} : cloneDeep(files)
}

const parseDependencies = (ops = {}) => {
  return {}
}

const parseSettings = (ops = {}) => {
  return {}
}

const state = {
  ready: false,
  showHelper: false,
  layoutHelper: 'horizontal',

  id: null,
  uid: null,
  files: {},
  dependencies: {},
  settings: {},

  active: null,
  open: new Set(),
  dirty: new Set(),
  peek: null
}

const mutations = {
  [t.PROJECT_RESET] (state) {
    state.ready = false

    // These are nice to disable
    // state.showHelper = false
    // state.layoutHelper = 'horizontal'

    state.id = null
    state.uid = null
    state.files = {}
    state.dependencies = {}
    state.settings = {}
    state.active = null
    state.open.clear()
    state.dirty.clear()
    state.peek = null
  },
  [t.PROJECT_SET_LOADED] (state, payload) {
    const copy = cloneDeep(payload)

    state.id = payload.id
    state.uid = payload.uid
    state.files = parseFiles(copy)
    state.dependencies = parseDependencies(copy)
    state.settings = parseSettings(copy)
    state.ready = true
  },
  [t.PROJECT_SAVE] (state) {
    state.dirty = new Set()
  },
  [t.PROJECT_SET_HELPER] (state, payload) {
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
  },
  [t.PROJECT_SET_ACTIVE] (state, payload) {
    state.active = payload
  },
  [t.PROJECT_WRITE_FILE] (state, { fullPath, contents }) {
    if (!state.files.hasOwnProperty(fullPath))
      return

    const file = state.files[fullPath]
    file.lastModified = +new Date()
    file.contents = contents
    Vue.set(state.files, fullPath, file)

    state.dirty.add(fullPath)
    state.dirty = new Set(state.dirty)

    if (fullPath === state.peek) {
      state.peek = null
      state.open.add(fullPath)
      state.open = new Set(state.open)
    }
  },
  [t.PROJECT_ADD_FILE] (state, { fullPath, item }) {
    if (!isValidPath(fullPath))
      return
    Vue.set(state.files, fullPath, item)
  },
  [t.PROJECT_DELETE_FILE] (state, fullPath) {
    if (!isValidPath(fullPath))
      return
    Vue.delete(state.files, fullPath)
  },
  [t.PROJECT_RENAME_FILE] (state, { fullPath, newFullPath, newName }) {
    if (!isValidPath(fullPath))
      return

    const copy = cloneDeep(state.files[fullPath])
    copy.fullPath = newFullPath
    copy.name = newName
    Vue.delete(state.files, fullPath)
    Vue.set(state.files, newFullPath, copy)

    // Handle dirty state
    state.dirty.delete(fullPath)
    state.dirty.add(newFullPath)
    state.dirty = new Set(state.dirty)
  }
}

const actions = {
  load ({ commit, getters }, project) {
    commit(t.PROJECT_RESET)
    commit(t.PROJECT_SET_LOADED, project)

    // Try to open defaults
    const defaults = ['README.md', 'index.js', 'index.html', 'package.json', 'config.json']
    const rootFiles = getters.filesInFolder().map(({ name }) => name)
    defaults.filter(v => -1 !== rootFiles.indexOf(v)).forEach(file => {
      commit(t.PROJECT_ADD_OPEN, file)
    })

  },
  doubleClick ({ commit }, fullPath) {
    commit(t.PROJECT_ADD_OPEN, fullPath)
  },
  click ({ commit }, fullPath) {
    commit(t.PROJECT_SET_PEEK, fullPath)
  },

  addNestedFile ({ commit }, { fullPath, item }) {
    if (!isValidPath(fullPath))
      return

    const meta = pathMeta(fullPath)

    // Create necessary folders
    for (const i in meta.folders) {
      const curPath = meta.folders.slice(0, i + 1).join('/')
      const curName = meta.folders[i]

      if (state.files.hasOwnProperty(curPath))
        continue

      commit(t.PROJECT_ADD_FILE, {
        fullPath: curPath,
        item: {
          fullPath: curPath,
          name: curName,
          type: 'folder'
        }
      })
    }

    commit(t.PROJECT_ADD_FILE, { fullPath, item })
  },

  deleteNestedFile ({ commit, getters }, fullPath) {
    if (!isValidPath(fullPath))
      return

    const { type } = getters.fileByFullPath(fullPath)
    if (!type)
      return

    if (type === 'file') {
      commit(t.PROJECT_CLOSE_OPEN, fullPath)
      commit(t.PROJECT_DELETE_FILE, fullPath)
    } else {
      const len = fullPath.length
      for (let name in state.files)
        if (name.substr(0, len) === fullPath) {
          const curFullPath = state.files[name].fullPath
          commit(t.PROJECT_CLOSE_OPEN, curFullPath)
          commit(t.PROJECT_DELETE_FILE, name)
        }
    }
  },

  addNewFile ({ dispatch, getters }, folder) {
    // Generate new filename
    const files = getters.filesInFolder(folder, 'file')
    const name = getUniqueName('New File', files)
    const fullPath = getFullPath(folder, name)

    // May need to set dirty here

    const item = {
      fullPath,
      name,
      type: 'file',
      contents: '',
      lastModified: +new Date()
    }

    dispatch('addNestedFile', { fullPath, item })
    return item
  },

  addNewFolder ({ dispatch, getters }, folder) {
    // Generate new filename (foldername)
    const files = getters.filesInFolder(folder, 'folder')
    const name = getUniqueName('New Folder', files)
    const fullPath = getFullPath(folder, name)

    // May need to set dirty here

    const item = {
      fullPath,
      name,
      type: 'folder'
    }

    dispatch('addNestedFile', { fullPath, item })
    return item
  },

  renameNestedFile ({ commit, getters, state }, { fullPath, newName }) {
    if (!isValidPath(fullPath))
      return

    const { type } = getters.fileByFullPath(fullPath)
    if (!type)
      return

    const { folders } = pathMeta(fullPath)
    const newFullPath = getFullPath(folders.join('/'), newName)

    // File already exists
    if (state.files.hasOwnProperty(newFullPath))
      return
    
    if (type === 'file') {
      commit(t.PROJECT_RENAME_FILE, { fullPath, newFullPath, newName })
      commit(t.PROJECT_CLOSE_OPEN, fullPath)
      commit(t.PROJECT_ADD_OPEN, newFullPath)
      commit(t.PROJECT_SET_ACTIVE, newFullPath)
    } else {
      const len = fullPath.length
      const files = cloneDeep(state.files) // Mutating iteratee
      for (let name in files) {
        if (name.substr(0, len) === fullPath) {
          const meta = pathMeta(name)
          commit(t.PROJECT_RENAME_FILE, {
            fullPath: name,
            newFullPath: getFullPath(newFullPath, name.substr(len)),
            newName: meta.name
          })
        }
      }
    }
  },

  save ({ commit, dispatch }, save = true) {
    if (save)
      commit(t.PROJECT_SAVE)

    const { id, files, dependencies, settings } = state

    // Invalidate Cached project
    dispatch('Bundler/invalidateCache', id, { root: true })

    return { id, files, dependencies, settings }
  },

  /*
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
  */
}

const getters = {
  projectName: state => {
    return packageJson(state, 'name', 'Untitled')
  },

  projectFiles: ({ files }) => {
    return filesTree(files)
  },

  projectDependencies: ({ dependencies }) => {
    const deps = get(dependencies, 'appDependencies', {})
    return Object.keys(deps).reduce((a, b) => {
      a.push({
        name: b,
        version: list[b]
      })
      return a
    }, [])
  },

  fileByFullPath: ({ files }) => fullPath => {
    return get(files, fullPath, null)
  },

  filesInFolder: ({ files }) => (folder = null, fileType = 'file') => {
    const fileValues = Object.values(files)

    // Root
    if (!folder) {
      return fileValues.filter(({ fullPath, type }) => {
        return fullPath.indexOf('/') < 0 && type === fileType
      })
    }

    const len = folder.length
    return fileValues.filter(({ fullPath, type }) => {
      const preCut = fullPath.substr(len)
      return preCut !== ''
             && preCut.indexOf('/') < 0
             && type === fileType
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
