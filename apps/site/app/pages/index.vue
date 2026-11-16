<script setup lang="ts">
// Accueil : rendu par le composant du layer, aussi utilisé par l'aperçu de l'admin.
const { data: content } = await usePublishedContent()
</script>

<template>
  <HomePage
    v-if="content"
    :content="content"
  />
</template>
