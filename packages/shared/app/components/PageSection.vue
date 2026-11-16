<script setup lang="ts">
import type { PropType } from 'vue'
import type { SectionBackground } from '#bessege/content/sections'

// Cadre commun des sections de l'accueil et des Infos pratiques : ancre (id),
// titre h2 modifiable (ACC-03) et fond alterné (ACC-02), calculés par
// shownSections. Le contenu propre à la section passe par le slot.
const props = defineProps({
  anchor: { type: String, required: true },
  title: { type: String, required: true },
  background: { type: String as PropType<SectionBackground>, default: 'background' },
  // Petit libellé au-dessus du titre (« En images »…), facultatif.
  eyebrow: { type: String, default: '' },
})

const titleId = computed(() => `titre-${props.anchor}`)
</script>

<template>
  <section
    :id="anchor"
    :class="['page-section', `page-section--${background}`]"
    :aria-labelledby="titleId"
  >
    <div class="page-section__inner">
      <div class="section-head">
        <span
          v-if="eyebrow"
          class="eyebrow"
        >{{ eyebrow }}</span>
        <h2 :id="titleId">
          {{ title }}
        </h2>
      </div>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.page-section { padding: clamp(64px, 9vw, 112px) 0; }

.page-section--background { background: var(--color-background); }

.page-section--neutral { background: var(--color-neutral); }

.page-section__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--gutter);
}

.section-head {
  display: grid;
  gap: 14px;
  max-width: 760px;
  margin-bottom: clamp(32px, 5vw, 56px);
}

.section-head h2 {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 3.6rem);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-title);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.eyebrow::before {
  width: 32px;
  height: 3px;
  content: '';
  background: var(--color-primary);
}
</style>
