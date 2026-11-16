<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'

// Bannière de l'accueil (ACC-05, ACC-06) : image de fond, nom de l'événement
// (seul h1 de la page), date, lieu, sous-titre, bouton d'inscription et, à
// droite, compte à rebours.
const props = defineProps({
  hero: { type: Object as PropType<BlockContent<'home.hero'>>, required: true },
  settings: { type: Object as PropType<BlockContent<'settings'>>, required: true },
})

// Sans lien propre, le bouton mène au lien d'inscription général.
const ctaUrl = computed(() => props.hero.cta.url || props.settings.registerUrl)
</script>

<template>
  <section
    id="accueil"
    class="hero"
  >
    <ResponsiveImage
      v-bind="hero.image"
      class="hero-bg"
      alt=""
      priority
    />
    <div class="hero-grid">
      <div>
        <span
          v-if="settings.edition"
          class="eyebrow"
        >{{ settings.edition }}</span>
        <h1>{{ settings.eventName }}</h1>
        <p
          v-if="hero.subtitle"
          class="hero-subtitle"
        >
          {{ hero.subtitle }}
        </p>
        <div class="hero-actions">
          <AppButton
            v-if="ctaUrl"
            :to="ctaUrl"
            target="_blank"
            rel="noopener"
          >
            {{ hero.cta.label }}<span class="visually-hidden"> (nouvel onglet)</span>
          </AppButton>
          <AppButton
            variant="outline"
            to="/#epreuves"
          >
            Voir les épreuves
          </AppButton>
        </div>
      </div>
      <div>
        <div
          v-if="settings.dateLabel || settings.place"
          class="hero-meta"
        >
          <span v-if="settings.dateLabel">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            ><rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="2"
            /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
            {{ settings.dateLabel }}
          </span>
          <span v-if="settings.place">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            ><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle
              cx="12"
              cy="10"
              r="2.5"
            /></svg>
            {{ settings.place }}
          </span>
        </div>
        <!-- ACC-11 : masquable indépendamment du reste de la bannière. -->
        <HeroCountdown
          v-if="hero.showCountdown"
          :start-date="settings.startDate"
          :after-text="hero.afterText"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: flex-end;
  min-height: min(88vh, 860px);
  padding: clamp(96px, 14vh, 160px) 0 clamp(48px, 8vh, 88px);
  color: var(--color-background);
  background: var(--color-secondary);
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ACC-06 : voile sombre sous le texte. Au plus clair, il garde 4,5:1 même sur une
   photo blanche (vérifié par test/contrast.test.ts, qui lit ces opacités). */
.hero::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-secondary) 70%, transparent) 0%, color-mix(in srgb, var(--color-secondary) 92%, transparent) 100%);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--gutter);
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
}

.eyebrow::before {
  width: 32px;
  height: 3px;
  content: '';
  background: var(--color-primary);
}

h1 {
  max-width: 12ch;
  margin: 18px 0 20px;
  font-size: clamp(3.4rem, 11vw, 8.5rem);
  color: var(--color-background);
}

.hero-subtitle {
  max-width: 640px;
  margin: 0 0 32px;
  font-size: clamp(1.1rem, 2vw, 1.3rem);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  font-weight: 600;
}

.hero-meta span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.hero-meta svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; }
}
</style>
