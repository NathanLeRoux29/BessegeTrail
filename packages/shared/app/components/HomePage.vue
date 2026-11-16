<script setup lang="ts">
import type { PropType } from 'vue'
import type { PublishedContent } from '#bessege/content/blocks'
import { homeSectionKeys, shownSections } from '#bessege/content/sections'

// Page d'accueil (spec 02), rendue par le site avec le contenu publié et par
// l'aperçu de l'admin avec les brouillons. Seules les sections affichées sont
// dans le HTML (ACC-01, ACC-04).
const props = defineProps({
  content: { type: Object as PropType<PublishedContent>, required: true },
})

const sections = computed(() => shownSections(homeSectionKeys, props.content))
</script>

<template>
  <div>
    <!-- Bannière à venir (#19). -->
    <h1>{{ content.settings.eventName }}</h1>
    <!-- Contenu propre à chaque section à venir (#21 à #25). -->
    <PageSection
      v-for="section in sections"
      :key="section.key"
      :anchor="section.anchor"
      :title="content[section.key].title"
      :background="section.background"
    />
  </div>
</template>
