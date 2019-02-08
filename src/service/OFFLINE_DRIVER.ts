import isArray from 'lodash-es/isArray'
import uuid from 'uuid'
import localforage from 'localforage'
import _API from '@aws-amplify/api'
import config from '@/config'
import { mergeDeep } from '@/lib/utils'
import PRESETS from '@/lib/PRESETS'

const { env } = config
const API = localforage.createInstance({
  name: env
})

const setList = async (key: string, value: any, matchKey: string) => {
  try {
    const list = await API.getItem(key)

    /**
     * Not an Array. Create Array, set value
     * and return.
     */
    if (!isArray(list))
      return await API.setItem(key, [ value ])

    const index = list.findIndex(item => item[matchKey] === value[matchKey])

    // Not found, just push it
    if (index < 0)
      list.push(value)
    // Replace
    else
      list[index] = value

    // Write back
    return API.setItem(key, list)
  } catch (e) {
    throw e
  }
}

const delList = async (key: string, id: string) => {
  try {
    let list = await API.getItem(key)

    /**
     * Not an Array. Create Array and return.
     */
    if (!isArray(list))
      return await API.setItem(key, [])

    // Filter away item
    list = list.filter(item => item.id !== id)

    // Write back
    return API.setItem(key, list)
  } catch (e) {
    throw e
  }
}

const post = async (type: string, item: IObject) => {
  try {
    const key = `${type}/${item.id}`
    await API.setItem(key, item)

    // Update list
    await setList(type, item, 'id')
    return item
  } catch (e) {
    throw e
  }
}

const del = async (type: string, id: string) => {
  try {
    const key = `${type}/${id}`
    await API.removeItem(key)

    // Update list
    await delList(type, id)
  } catch (e) {
    throw e
  }
}

const putParam = async (type: string, id: string, body: IObject) => {
  try {
    const key = `${type}/${id}`
    const old: IObject = await API.getItem(key) // TODO: handle not found
    const merged = mergeDeep(old, body)

    // Re-assign write protected properties
    merged.uid = old.uid
    merged.id = old.id
    merged.createdAt = old.createdAt

    await API.setItem(key, merged)

    // Update list
    await setList(type, merged, 'id')
    return merged
  } catch (e) {
    throw e
  }
}

export default async (method: string, path: string, opts?: IObject) => {
  try {
    console.log(`OFFLINE: ${method} ${path} ${opts}`)

    // Remove '/' at beginning
    path = path.charAt(0) === '/' ? path.substr(1) : path

    // parse potential single param
    const [ resource, param ] = path.split('/')

    switch (method) {
      case 'get':
        /**
         * Param is present.
         */
        if (param) {
          /**
           * GET /integration/{id}
           * Get a public integration
           */
          if (resource === 'integration')
            return _API.get(env, `/integration/${param}`, null)

          /**
           * GET /widget/{id}
           * Get a public widget
           */
          else if (resource === 'widget')
            return _API.get(env, `/widget/${param}`, null)

          /**
           * GET /cdn/{package}
           * Turbo CDN
           */
          else if (resource === 'cdn')
            return await _API.get(env, `/cdn/${param}`, null)
        }

        const item = await API.getItem(`/${path}`)
        return item || []
      case 'post':

        /**
         * Body is present.
         */
        if (opts) {
          /**
           * POST /integration { id: x }
           * Copy existing integration
           */
          if (resource === 'integration' && opts.body.id) {
            const integration = await _API.get(env, `/integration/${opts.body.id}`, null)

            // Re-assign write protected properties
            integration.uid = 0
            integration.id = uuid.v1()
            integration.createdAt = Date.now()
            integration.updatedAt = Date.now()

            return post('/integration', integration)

          /**
           * POST /widget { id: x }
           * Copy existing widget
           */
          } else if (resource === 'widget' && opts.body.id) {
            const widget = await _API.get(env, `/widget/${opts.body.id}`, null)

            // Re-assign write protected properties
            widget.uid = 0
            widget.id = uuid.v1()
            widget.createdAt = Date.now()
            widget.updatedAt = Date.now()

            return post('/widget', widget)

          /**
           * POST /resolver { name, version }
           * Turbo resolver
           */
          } else if (resource === 'resolver')
            return await _API.post(env, '/resolver', opts)
        }

        /**
         * POST /dashboard
         * Create a new dashboard.
         */
        if (resource === 'dashboard') {
          return await post('/dashboard', {
            uid: 0,
            id: uuid.v1(),
            label: 'New Dashboard',
            settings: {
              rgba: { r: 241, g: 241, b: 241, a: 1 }
            },
            widgets: [],
            integrations: [],
            createdAt: Date.now()
          })

        /**
         * POST /integration
         * Create a new integration
         */
        } else if (resource === 'integration') {
          return post('/integration', Object.assign(PRESETS.BLANK_INTEGRATION, {
            uid: 0,
            id: uuid.v1(),
            createdAt: Date.now(),
            updatedAt: Date.now()
          }))

        /**
         * POST /widget
         * Create a new widget
         */
        } else if (resource === 'widget') {
          return post('/widget', Object.assign(PRESETS.BLANK_WIDGET, {
            uid: 0,
            id: uuid.v1(),
            createdAt: Date.now(),
            updatedAt: Date.now()
          }))
        }
        break
      case 'put':

        /**
         * Param is present.
         */
        if (param) {
          const id = param
          const body = opts && opts.body ? opts.body : {}

          /**
           * PUT /dashboard/{id}
           * Commit a local dashboard
           */
          if (resource === 'dashboard')
            return await putParam('/dashboard', id, body)

          /**
           * PUT /widget/{id}
           * Commit a local widget
           */
          else if (resource === 'widget')
            return await putParam('/widget', id, body)

          /**
           * PUT /integration/{id}
           * Commit a local integration
           */
          else if (resource === 'integration')
            return await putParam('/integration', id, body)
        }
        break
      case 'del':
        /**
         * Param is present.
         */
        if (param) {
          const id = param

          /**
           * DELETE /dashboard/{id}
           * Delete a dashboard
           */
          if (resource === 'dashboard')
            return del('/dashboard', id)

          /**
           * DELETE /integration/{id}
           * Delete an integration
           */
          else if (resource === 'integration')
            return del('/integration', id)

          /**
           * DELETE /widget/{id}
           * Delete a widget
           */
          else if (resource === 'widget')
            return del('/widget', id)
        }

      // case 'head': return API.head(env, path, opts)
      default:
        console.warn(`OFFLINE: ${method} not applicable`)
        return null
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}
