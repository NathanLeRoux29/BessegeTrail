<script setup lang="ts">
import type { PropType } from 'vue'
import type { KeyFigure } from '#bessege/content/key-figures'

// Bandeau de chiffres clés sous la bannière (ACC-35), calculé par keyFigures.
defineProps({
  figures: { type: Array as PropType<KeyFigure[]>, required: true },
})
</script>

<template>
  <div
    v-if="figures.length"
    class="key-figures"
  >
    <ul aria-label="Chiffres clés">
      <li
        v-for="figure in figures"
        :key="figure.label"
      >
        <!-- Espace lu par les lecteurs d'écran : « 5 épreuves », pas « 5épreuves ». -->
        <strong>{{ figure.value }}</strong>{{ ' ' }}<span>{{ figure.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.key-figures {
  color: var(--color-background);
  background: var(--color-secondary);
  border-top: 1px solid color-mix(in srgb, var(--color-background) 12%, transparent);
}

ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px var(--gutter);
  list-style: none;
}

li { text-align: center; }

strong {
  display: block;
  font-family: var(--font-title);
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 800;
  line-height: 1;
  color: var(--color-primary);
}

span {
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (max-width: 640px) {
  ul {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 12px;
  }
}
</style>
