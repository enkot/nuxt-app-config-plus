<template>
  <div>
    Nuxt module playground!
    {{ config.foo }}
  </div>
</template>

<script setup lang="ts">
const config = useAppConfig()
</script>
