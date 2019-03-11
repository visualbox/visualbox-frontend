export default {
  BLANK_INTEGRATION: {
    files: {
      'index.js': {
        contents: '// Source code\n',
        fullPath: 'index.js',
        lastModified: +new Date(),
        name: 'index.js',
        type: 'file'
      },
      'README.md': {
        contents: '# Readme\n',
        fullPath: 'README.md',
        lastModified: +new Date(),
        name: 'README.md',
        type: 'file'
      },
      'package.json': {
        contents: `{
  "name": "New Integration",
  "version": "1.0.0",
  "public": false,
  "tags": [],
  "dependencies": {}
}`,
        fullPath: 'package.json',
        lastModified: +new Date(),
        name: 'package.json',
        type: 'file'
      },
      'config.json': {
        contents: '[]\n',
        fullPath: 'config.json',
        lastModified: +new Date(),
        name: 'config.json',
        type: 'file'
      }
    }
  },

  BLANK_WIDGET: {
    files: {
      'index.html': {
        contents: '<span>Source code</span>\n',
        fullPath: 'index.html',
        lastModified: +new Date(),
        name: 'index.html',
        type: 'file'
      },
      'README.md': {
        contents: '# Readme\n',
        fullPath: 'README.md',
        lastModified: +new Date(),
        name: 'README.md',
        type: 'file'
      },
      'package.json': {
        contents: `{
  "name": "New Widget",
  "version": "1.0.0",
  "public": false,
  "tags": [],
  "dependencies": {}
}`,
        fullPath: 'package.json',
        lastModified: +new Date(),
        name: 'package.json',
        type: 'file'
      },
      'config.json': {
        contents: '[]\n',
        fullPath: 'config.json',
        lastModified: +new Date(),
        name: 'config.json',
        type: 'file'
      }
    }
  }
}
