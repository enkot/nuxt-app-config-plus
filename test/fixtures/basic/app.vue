<template>
  <div>
    {{ config.foo.bar.cat.name + ' ' + config.foo.catDog.name + ' ' + config.foo.bar.isAnimal }}
  </div>
</template>

<script setup>
const config = useAppConfig()
</script>
