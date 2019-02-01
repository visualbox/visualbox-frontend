import algoliasearch from 'algoliasearch'

const client = algoliasearch(process.env.VUE_APP_ALGOLIASEARCH_APP_ID, process.env.VUE_APP_ALGOLIASEARCH_KEY)

export const integrationsIndex = client.initIndex(process.env.VUE_APP_ALGOLIASEARCH_INTEGRATIONS_INDEX)
export const widgetsIndex = client.initIndex(process.env.VUE_APP_ALGOLIASEARCH_WIDGETS_INDEX)
