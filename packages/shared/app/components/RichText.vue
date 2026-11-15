<script setup lang="ts">
import { renderRichText } from '../../shared/content/rich-text'

// Seul moyen d'afficher un texte mis en forme : il est assaini au rendu (CNT-06),
// en plus de l'être à l'enregistrement.
const props = defineProps<{ html: string }>()

const safeHtml = computed(() => renderRichText(props.html))
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- assaini par renderRichText (CNT-06) -->
  <div
    class="rich-text"
    v-html="safeHtml"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<style scoped>
.rich-text :deep(h3) {
  margin: 1.4em 0 0.5em;
  font-size: 1.4rem;
}

.rich-text :deep(p),
.rich-text :deep(ul),
.rich-text :deep(ol) { margin: 0 0 1em; }

.rich-text :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.rich-text :deep(a:hover) { text-decoration-color: var(--color-primary); }

.rich-text > :deep(:first-child) { margin-top: 0; }

.rich-text > :deep(:last-child) { margin-bottom: 0; }
</style>
