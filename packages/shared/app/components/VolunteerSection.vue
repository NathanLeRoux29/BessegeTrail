<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'
import type { SectionBackground } from '#bessege/content/sections'

// Section Bénévoles de l'accueil (ACC-24) : carte vert foncé avec un texte mis en
// forme, une image facultative et un bouton vers un lien externe (formulaire).
defineProps({
  block: { type: Object as PropType<BlockContent<'home.benevoles'>>, required: true },
  anchor: { type: String, required: true },
  background: { type: String as PropType<SectionBackground>, default: 'background' },
})
</script>

<template>
  <PageSection
    :anchor="anchor"
    :title="block.title"
    :background="background"
    eyebrow="Rejoignez l’équipe"
    panel
  >
    <RichText
      v-if="block.text"
      :html="block.text"
    />
    <!-- Sans lien, pas de bouton. -->
    <AppButton
      v-if="block.button.url"
      class="volunteer-button"
      :to="block.button.url"
      target="_blank"
      rel="noopener"
    >
      {{ block.button.label }}<span class="visually-hidden"> (nouvel onglet)</span>
    </AppButton>
    <template
      v-if="block.image.src"
      #aside
    >
      <ResponsiveImage
        v-bind="block.image"
        class="volunteer-image"
        sizes="(max-width: 860px) 100vw, 45vw"
      />
    </template>
  </PageSection>
</template>

<style scoped>
.volunteer-button { margin-top: 24px; }

.volunteer-image {
  width: 100%;
  height: 100%;
  min-height: 320px;
  object-fit: cover;
}

@media (max-width: 860px) {
  .volunteer-image {
    min-height: 220px;
    aspect-ratio: 16 / 9;
  }
}
</style>
