<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      title: 'Options API',
    }
  },
  head() {
    return {
      title: this.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: () => this.title,
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    }
  },
  methods: {
    update() {
      this.title = 'Updated Options API'
    },
  },
})
</script>

<template>
  <div>
    options api - basic
    <button @click="update">
      update
    </button>
  </div>
</template>
