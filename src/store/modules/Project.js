import Vue from 'vue'
import * as t from '@/store/types'
import get from 'lodash-es/get'
import { cloneDeep, filesTree } from '@/lib/utils'

const packageJson = (files, path, def) => {
  try {
    const { contents } = files['package.json']
    const json = JSON.parse(contents)
    return get(json, path, def)
  } catch (e) {
    return def
  }
}

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
    state.showHelper = false
    state.layoutHelper = 'horizontal'

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

    state.files = parseFiles(copy)
    state.dependencies = parseDependencies(copy)
    state.settings = parseSettings(copy)
    state.ready = true
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

    // Was peeking closed
    if (state.peek === payload)
      state.peek = null

    // Find new active
    if (state.active === payload) {
      if (state.open.size <= 0)
        state.active = null
      else
        state.active = [...state.open][state.open.size - 1]
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
  [t.PROJECT_ADD_FILE] (state, { fullPath, type }) {
    // Generate new filename
    const prependPath = (!fullPath || fullPath === '') ? '' : `${fullPath}/`
    const getFileName = i => type === 'file' ? `New File (${i})` : `New Folder (${i})`
    let tryName = type === 'file' ? 'New File' : 'New Folder'
    const existing = Object.keys(state.files)

    let i = 0
    while (existing.includes(`${prependPath + tryName}`)) {
      i++
      tryName = getFileName(i)
    }

    const newFullPath = prependPath + tryName
    Vue.set(state.files, newFullPath, {
      name: tryName,
      contents: '',
      fullPath: newFullPath,
      type
    })
    return state.files[newFullPath]
  },
  [t.PROJECT_DELETE_FILE] (state, { fullPath, type }) {
    if (type === 'folder') {
      const len = fullPath.length
      for (let name in state.files) {
        const subName = name.substr(0, len)
        if (subName === fullPath)
          delete state.files[name]
      }
    } else
      delete state.files[fullPath]
    state.files = cloneDeep(state.files)

    // Dirty
    if (state.dirty.has(fullPath)) {
      state.dirty.delete(fullPath)
      state.dirty = new Set(state.dirty)
    }
  },
  [t.PROJECT_RENAME_FILE] (state, { fullPath, newName }) {
    // open, dirty, active, peek, files

  }
}

const actions = {
  load ({ commit }, project) {
    commit(t.PROJECT_RESET)
    commit(t.PROJECT_SET_LOADED, project)
  },
  doubleClick ({ commit }, fullPath) {
    commit(t.PROJECT_ADD_OPEN, fullPath)
  },
  click ({ commit }, fullPath) {
    commit(t.PROJECT_SET_PEEK, fullPath)
  },
  add ({ commit }, { fullPath, type }) {
    const newFile = commit(t.PROJECT_ADD_FILE, { fullPath, type })
  },
  delete ({ commit, getters }, fullPath) {
    const file = getters.fileByFullPath(fullPath)
    if (file)
      commit(t.PROJECT_DELETE_FILE, file)
    commit(t.PROJECT_CLOSE_OPEN, fullPath)
  },
  rename ({ commit, getter }, { fullPath, newName }) {
    // Construct new fullPath
    let fullPathSplit = fullPath.split('/')
    fullPathSplit.pop()
    const newFullPath = fullPathSplit.join('/') + '/' +
    fullPathSplit.push()
    const { type } = getter.fileByFullPath(fullPath)
    if (type === 'file')
      commit(t.PROJECT_RENAME_FILE, { fullPath, newName })
    else
      commit(t.PROJECT_RENAME_FOLDER, { fullPath, newName })
  }
}

const getters = {
  projectName: ({ files }) => {
    return packageJson(files, 'name', 'Untitled')
  },

  projectFiles: ({ files }) => {
    return filesTree(files)
  },

  fileByFullPath: ({ files }) => fullPath => {
    return get(files, fullPath, null)
  }
}


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
  let pkg = cloneDeep(get(state, 'loaded.package', {}))
  if (!pkg.hasOwnProperty('dependencies'))
    pkg.dependencies = {}
  return pkg
}


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

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
