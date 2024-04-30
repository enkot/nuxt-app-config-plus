<template>
  <div>
    {{ config.foo.fooBar.cat.name + ' ' + config.foo.catDog.name + ' ' + config.foo.fooBar.isAnimal }}
  </div>
</template>

<script setup>
const config = useAppConfig()
</script>
