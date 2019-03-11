module.exports = {
  locales: {
    '/': {
      lang: 'en-US',
      title: 'VisualBox',
      description: 'Integration and visualization toolbox'
    }
  },
  serviceWorker: true,
  themeConfig: {
    repo: 'visualbox',
    docsDir: 'docs',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        nav: [
          {
            text: 'Guide',
            link: '/guide/'
          },
          {
            text: 'Integrations',
            link: '/integrations/'
          },
          {
            text: 'Widgets',
            link: '/widgets/'
          },
          {
            text: 'Configuration Model',
            link: '/configmodel/'
          }
        ],
        sidebar: [
          '/',
          '/guide/'
        ]
      }
    }
  }
}
