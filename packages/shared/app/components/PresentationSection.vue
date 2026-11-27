<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'
import type { SectionBackground } from '#bessege/content/sections'

// Section Présentation de l'accueil (ACC-12, ACC-13) : titre, texte mis en forme
// et image facultative à côté du texte.
defineProps({
  block: { type: Object as PropType<BlockContent<'home.presentation'>>, required: true },
  anchor: { type: String, required: true },
  background: { type: String as PropType<SectionBackground>, default: 'background' },
  // Édition (« 1re édition »), au-dessus du titre.
  edition: { type: String, default: '' },
})
</script>

<template>
  <PageSection
    :anchor="anchor"
    :title="block.title"
    :background="background"
    :eyebrow="edition"
  >
    <RichText
      v-if="block.text"
      :html="block.text"
    />
    <template
      v-if="block.image.src"
      #aside
    >
      <ResponsiveImage
        v-bind="block.image"
        class="presentation-image"
        sizes="(max-width: 860px) 100vw, 45vw"
      />
    </template>
  </PageSection>
</template>

<style scoped>
.presentation-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius);
  box-shadow: 16px 16px 0 var(--color-primary);
}

@media (max-width: 860px) {
  .presentation-image { box-shadow: 10px 10px 0 var(--color-primary); }
}
</style>
