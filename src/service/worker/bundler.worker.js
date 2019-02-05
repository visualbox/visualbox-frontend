import rollup from 'rollup/dist/rollup.browser'

/**
 * 
 */
let modules = []

onmessage = ({ data }) => {
  const { type, payload } = data

  switch (type) {
    /**
     * READY
     * Clean up everything (abort?).
     */
    case 'READY':
      modules = []
      break

    /**
     * ADD_MODULE
     * Add incoming module to module collection.
     */
    case 'ADD_MODULE':
      modules.push(payload)
      break

    /**
     * BUNDLE
     * Start the bundle process.
     */
    case 'BUNDLE':
      postMessage({ msg: 'READY TO START' + modules })
      break
    default:
      console.warn(`[Bundler]: Unknown message type "${type}"`)
  }
}

/*
importScripts('https://unpkg.com/rollup/dist/rollup.browser.js');

const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|\/])/;
function isAbsolute(path) {
  return absolutePath.test(path);
}
function dirname(path) {
  const match = /(\/|\\)[^\/\\]*$/.exec(path);
  if (!match) return '.';

  const dir = path.slice(0, -match[0].length);

  // If `dir` is the empty string, we're at root.
  return dir ? dir : '/';
}

function resolve(...paths) {
  let resolvedParts = paths.shift().split(/[\/\\]/);

  paths.forEach(path => {
    if (isAbsolute(path)) {
      resolvedParts = path.split(/[\/\\]/);
    } else {
      const parts = path.split(/[\/\\]/);

      while (parts[0] === '.' || parts[0] === '..') {
        const part = parts.shift();
        if (part === '..') {
          resolvedParts.pop();
        }
      }

      resolvedParts.push.apply(resolvedParts, parts);
    }
  });

  return resolvedParts.join('/'); // TODO windows...
}

const modules = [
  {
    name: 'index.js',
    code: `

import { life } from './foo/a.js'
console.log('My ', life);

`,
    isEntry: true
  },
  {
    name: 'foo/a.js',
    code: `export const life = 42;`,
    isEntry: false
  }
];

let moduleById = {};
modules.forEach(module => {
  moduleById[module.name] = module;
});
console.log(moduleById)

let warnings = [];
const inputOptions = {
  input: 'index.js',
  plugins: [{
    resolveId(importee, importer) {
      if (!importer) return importee;
      if (importee[0] !== '.') return false;
      let resolved = resolve(dirname(importer), importee).replace(/^\.\//, '');
      if (resolved in moduleById) return resolved;
      resolved += '.js';
      if (resolved in moduleById) return resolved;
      throw new Error(`Could not resolve '${importee}' from '${importer}'`);
    },
    load: function (id) {
      return moduleById[id].code;
    }
  }],
  onwarn(warning) {
    warnings.push(warning);
    console.group(warning.loc ? warning.loc.file : '');
    console.warn(warning.message);
    if (warning.frame) {
      console.log(warning.frame);
    }
    if (warning.url) {
      console.log(`See ${warning.url} for more information`);
    }
    console.groupEnd();
  }
};

const outputOptions = {
  name: 'MyIntegration',
  file: 'output.js',
  format: 'iife',
  // amd: { id: '' },
  sourcemap: true,
  globals: {
    a: 'a'
  }
};

console.warn('Start rollup');
rollup.rollup(inputOptions)
  .then(bundle => {
    console.warn('Got bundle', bundle);
    return bundle.generate(outputOptions)
  })
  .then(result => {
    console.log('OK', result)
    console.log('Got warnings', warnings)
  })
  .catch(e => {
    console.error(e);
  });

for (let i = 0; i < 10; i++) {
  let level = ''
  for (let j = 0; j < i; j++) {
    level += '.'
  }
  postMessage({ n: level })
}

*/
