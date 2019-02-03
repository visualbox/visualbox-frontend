<template lang="pug">
editor-ctx(v-if="ready")
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { EditorCtx } from '@/components'

export default Vue.extend({
  name: 'IntegrationCtx',
  components: { EditorCtx },
  computed: mapState('Project', ['ready'])
})
</script>
