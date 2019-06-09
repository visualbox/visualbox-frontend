<template lang="pug">
v-select(
  v-model="internalValue"
  :items="runtimes"
  :disabled="loading || disabled"
  item-text="text"
  item-value="runtime"
  hide-details single-line
  outlined
)
  template(#selection="{ item }")
    v-icon.mr-3(:color="item.color") {{ item.icon }}
    span {{ item.text }}
  template(#item="{ item }")
    v-icon.mr-3(:color="item.color") {{ item.icon }}
    span {{ item.text }}
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { proxyValue } from '@/mixins'

export default {
  name: 'SelectRuntime',
  mixins: [proxyValue],
  props: ['loading', 'disabled'],
  data: () => ({
    runtimes: [
      {
        text: 'Node.js',
        runtime: 'node',
        icon: 'mdi-nodejs',
        color: '#43853d'
      },
      {
        text: 'Python 3.6',
        runtime: 'python3',
        icon: 'mdi-language-python',
        color: '#4180b1'
      },
      {
        text: 'Go',
        runtime: 'golang',
        icon: 'mdi-language-go',
        color: '#29beb1'
      }
      /*
      {
        text: 'Java',
        runtime: 'java',
        icon: 'mdi-language-java',
        color: '#e11e21'
      },
      {
        text: 'C',
        runtime: 'c',
        icon: 'mdi-language-c',
        color: '#f7ef21'
      }
      */
    ]
  })
}
</script>
