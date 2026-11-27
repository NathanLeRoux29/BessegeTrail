<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'
import { frenchNumber, type VisibleRace } from '#bessege/content/races'
import type { SectionBackground } from '#bessege/content/sections'

// Section Les épreuves de l'accueil (ACC-14 à ACC-17) : une carte par épreuve
// visible, chacune entièrement cliquable vers la page de l'épreuve.
defineProps({
  block: { type: Object as PropType<BlockContent<'home.epreuves'>>, required: true },
  // Épreuves visibles, dans l'ordre (visibleRaces).
  races: { type: Array as PropType<VisibleRace[]>, required: true },
  anchor: { type: String, required: true },
  background: { type: String as PropType<SectionBackground>, default: 'background' },
})
</script>

<template>
  <PageSection
    :anchor="anchor"
    :title="block.title"
    :background="background"
    :intro="block.intro"
    eyebrow="Choisissez votre défi"
  >
    <ul class="race-grid">
      <li
        v-for="race in races"
        :key="race.slug"
      >
        <!-- ACC-15 : un seul lien, la carte entière. -->
        <NuxtLink
          class="race-card"
          :to="`/epreuves/${race.slug}`"
        >
          <ResponsiveImage
            v-bind="race.image"
            alt=""
            sizes="(max-width: 460px) 100vw, (max-width: 720px) 50vw, (max-width: 1100px) 33vw, 20vw"
          />
          <span class="race-badge">{{ race.type }}</span>
          <span
            v-if="race.distance !== null"
            class="race-distance"
          >{{ frenchNumber.format(race.distance) }}<small> km</small></span>
          <span class="race-name">{{ race.name }}</span>
          <span class="race-more">
            Découvrir
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            ><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </PageSection>
</template>

<style scoped>
/* ACC-17 : une colonne sur mobile, plusieurs sur ordinateur. */
.race-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (max-width: 1100px) {
  .race-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 720px) {
  .race-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 460px) {
  .race-grid { grid-template-columns: 1fr; }
}

.race-card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  min-height: 360px;
  padding: 20px;
  overflow: hidden;
  color: var(--color-background);
  text-decoration: none;
  background: var(--color-secondary);
  border-radius: var(--radius);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.race-card img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

/* Voile sous le texte, comme la bannière. */
.race-card::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-secondary) 5%, transparent) 20%, color-mix(in srgb, var(--color-secondary) 96%, transparent) 78%);
}

.race-card:hover {
  box-shadow: 0 18px 36px color-mix(in srgb, var(--color-secondary) 30%, transparent);
  transform: translateY(-6px);
}

.race-card:hover img { transform: scale(1.06); }

.race-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 4px 10px;
  font-family: var(--font-title);
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-secondary);
  background: var(--color-background);
  border-radius: 999px;
}

.race-distance {
  font-family: var(--font-title);
  font-size: 4rem;
  font-weight: 800;
  line-height: 0.9;
  color: var(--color-primary);
}

.race-distance small { font-size: 1.6rem; }

.race-name {
  margin: 6px 0 14px;
  font-family: var(--font-title);
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.05;
  text-transform: uppercase;
}

.race-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
}

.race-more svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.2s ease;
}

.race-card:hover .race-more svg { transform: translateX(4px); }
</style>
