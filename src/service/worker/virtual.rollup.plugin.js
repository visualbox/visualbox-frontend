const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|\/])/

const isAbsolute = path => absolutePath.test(path)

const dirname = path => {
  const match = /(\/|\\)[^\/\\]*$/.exec(path)
  if (!match)
    return '.'

  const dir = path.slice(0, -match[0].length)

  // If `dir` is the empty string, we're at root.
  return dir || '/'
}

const resolve = (...paths) => {
  let resolvedParts = paths.shift().split(/[\/\\]/)

  paths.forEach(path => {
    if (isAbsolute(path)) {
      resolvedParts = path.split(/[\/\\]/)
    } else {
      const parts = path.split(/[\/\\]/)

      while (parts[0] === '.' || parts[0] === '..') {
        const part = parts.shift()
        if (part === '..')
          resolvedParts.pop()
      }

      resolvedParts.push.apply(resolvedParts, parts)
    }
  })

  return resolvedParts.join('/')
}

export default (modules) => {
  return {
    name: 'rollup-plugin-virtual',
    resolveId (importee, importer) {
      if (!importer)
        return importee
      if (importee[0] !== '.')
        return false

      let resolved = resolve(dirname(importer), importee).replace(/^\.\//, '')
      if (resolved in modules)
        return resolved

      resolved += '.js'
      if (resolved in modules)
        return resolved

      throw new Error(`Could not resolve '${importee}' from '${importer}'`)
    },
    load (id) {
      return modules[id].code
    }
  }
}