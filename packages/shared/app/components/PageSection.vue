<script setup lang="ts">
import type { PropType } from 'vue'
import type { SectionBackground } from '#bessege/content/sections'

// Cadre commun des sections de l'accueil et des Infos pratiques : ancre (id),
// titre h2 modifiable (ACC-03) et fond alterné (ACC-02), calculés par
// shownSections. Le contenu propre à la section passe par le slot ; le slot
// `aside` (une image) forme une seconde colonne, qui passe dessous sur mobile.
const props = defineProps({
  anchor: { type: String, required: true },
  title: { type: String, required: true },
  background: { type: String as PropType<SectionBackground>, default: 'background' },
  // Petit libellé au-dessus du titre (« En images »…), facultatif.
  eyebrow: { type: String, default: '' },
  // Texte d'introduction sous le titre, facultatif.
  intro: { type: String, default: '' },
  // Carte vert foncé, image à gauche (Bénévoles).
  panel: { type: Boolean, default: false },
  // Titre et contenu centrés (Contact).
  centered: { type: Boolean, default: false },
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
      <div
        :class="['page-section__layout', {
          'page-section__layout--split': $slots.aside,
          'page-section__layout--panel': panel,
          'page-section__layout--centered': centered,
        }]"
      >
        <div class="page-section__main">
          <div class="section-head">
            <span
              v-if="eyebrow"
              class="eyebrow"
            >{{ eyebrow }}</span>
            <h2 :id="titleId">
              {{ title }}
            </h2>
            <p v-if="intro">
              {{ intro }}
            </p>
          </div>
          <slot />
        </div>
        <div
          v-if="$slots.aside"
          class="page-section__aside"
        >
          <slot name="aside" />
        </div>
      </div>
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

/* ACC-13 : texte et image côte à côte sur ordinateur, image dessous sur mobile. */
.page-section__layout--split {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: clamp(32px, 6vw, 80px);
  align-items: center;
}

/* Carte vert foncé, image à gauche et collée aux bords (Bénévoles). */
.page-section__layout--panel {
  overflow: hidden;
  color: var(--color-background);
  background: var(--color-secondary);
  border-radius: calc(var(--radius) * 1.6);
}

.page-section__layout--panel.page-section__layout--split {
  grid-template-columns: 1fr 1.2fr;
  gap: 0;
  align-items: stretch;
}

.page-section__layout--panel .page-section__aside { order: -1; }

.page-section__layout--panel .page-section__main { padding: clamp(28px, 5vw, 56px); }

.page-section__layout--panel .section-head {
  margin-bottom: 20px;
}

.page-section__layout--panel h2,
.page-section__layout--panel .eyebrow { color: var(--color-background); }

/* Titre et contenu centrés (Contact). */
.page-section__layout--centered { text-align: center; }

.page-section__layout--centered .section-head {
  justify-items: center;
  margin-inline: auto;
}

@media (max-width: 860px) {
  .page-section__layout--split,
  .page-section__layout--panel.page-section__layout--split { grid-template-columns: 1fr; }
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

.section-head p {
  margin: 2px 0 0;
  font-size: 1.125rem;
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
