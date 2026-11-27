<script setup lang="ts">
import type { PropType } from 'vue'
import type { PublishedContent } from '#bessege/content/blocks'
import { keyFigures } from '#bessege/content/key-figures'
import { visibleRaces } from '#bessege/content/races'
import { homeSectionKeys, shownSections } from '#bessege/content/sections'

// Page d'accueil (spec 02), rendue par le site avec le contenu publié et par
// l'aperçu de l'admin avec les brouillons. Seules les sections affichées sont
// dans le HTML (ACC-01, ACC-04).
const props = defineProps({
  content: { type: Object as PropType<PublishedContent>, required: true },
})

const sections = computed(() => shownSections(homeSectionKeys, props.content))
const figures = computed(() => keyFigures(props.content))
const races = computed(() => visibleRaces(props.content))
</script>

<template>
  <div>
    <HomeHero
      :hero="content['home.hero']"
      :settings="content.settings"
    />
    <KeyFigures :figures="figures" />
    <template
      v-for="section in sections"
      :key="section.key"
    >
      <PresentationSection
        v-if="section.key === 'home.presentation'"
        :block="content['home.presentation']"
        :anchor="section.anchor"
        :background="section.background"
        :edition="content.settings.edition"
      />
      <RacesSection
        v-else-if="section.key === 'home.epreuves'"
        :block="content['home.epreuves']"
        :races="races"
        :anchor="section.anchor"
        :background="section.background"
      />
      <!-- Contenu propre aux autres sections à venir (#23 à #25). -->
      <PageSection
        v-else
        :anchor="section.anchor"
        :title="content[section.key].title"
        :background="section.background"
      />
    </template>
  </div>
</template>
