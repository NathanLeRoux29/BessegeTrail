<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'
import type { SectionBackground } from '#bessege/content/sections'

// Section Partenaires de l'accueil (ACC-28 à ACC-34) : bandeau de logos qui défile
// de gauche à droite. Une seconde copie des logos ferme la boucle ; elle est
// cachée aux lecteurs d'écran et sortie de l'ordre de tabulation (ACC-34). Si les
// logos tiennent dans la largeur, ou si le visiteur réduit les animations, ils
// forment une grille fixe, sans copie ni bouton de pause (ACC-33).
const props = defineProps({
  block: { type: Object as PropType<BlockContent<'home.partenaires'>>, required: true },
  anchor: { type: String, required: true },
  background: { type: String as PropType<SectionBackground>, default: 'background' },
})

// ACC-31 : même durée par logo, donc même vitesse quel que soit leur nombre.
const duration = computed(() => `${props.block.items.length * 5}s`)

const paused = ref(false)
// Rendu serveur : défilement (la media query couvre prefers-reduced-motion).
const isStatic = ref(false)

const marquee = useTemplateRef<HTMLElement>('marquee')

// Mesure faite sans la grille fixe, qui ferait passer les logos à la ligne.
async function layout() {
  isStatic.value = false
  await nextTick()
  const track = marquee.value?.querySelector('.marquee-track')
  if (!marquee.value || !track) return
  const fits = track.scrollWidth <= marquee.value.clientWidth
  isStatic.value = fits || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  layout()
  window.addEventListener('resize', layout)
})

onBeforeUnmount(() => window.removeEventListener('resize', layout))
</script>

<template>
  <PageSection
    :anchor="anchor"
    :title="block.title"
    :background="background"
    eyebrow="Merci à eux"
  >
    <div
      ref="marquee"
      :class="['marquee', `marquee--${background}`, { 'is-static': isStatic, 'is-paused': paused }]"
      :style="{ '--duration': duration }"
    >
      <ul
        v-for="copy in [false, true]"
        :key="String(copy)"
        class="marquee-track"
        :aria-hidden="copy ? 'true' : undefined"
      >
        <li
          v-for="(item, index) in block.items"
          :key="index"
        >
          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noopener"
            :tabindex="copy ? -1 : undefined"
          >
            <ResponsiveImage
              :src="item.logo"
              :alt="copy ? '' : item.name"
            />
            <span
              v-if="!copy"
              class="visually-hidden"
            >(nouvel onglet)</span>
          </a>
          <div v-else>
            <ResponsiveImage
              :src="item.logo"
              :alt="copy ? '' : item.name"
            />
          </div>
        </li>
      </ul>
    </div>
    <!-- ACC-32 : arrêt durable du défilement (WCAG 2.2.2). -->
    <AppButton
      v-if="!isStatic"
      class="marquee-toggle"
      variant="outline"
      :aria-pressed="paused"
      @click="paused = !paused"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      ><path :d="paused ? 'M7 5l12 7-12 7V5Z' : 'M9 5v14M15 5v14'" /></svg>
      {{ paused ? 'Reprendre le défilement' : 'Mettre en pause le défilement' }}
    </AppButton>
  </PageSection>
</template>

<style scoped>
/* Bords estompés ; un peu de marge pour ne pas rogner le contour de focus. */
.marquee {
  display: flex;
  gap: 16px;
  padding-block: 6px;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, var(--color-text) 6%, var(--color-text) 94%, transparent);
}

.marquee-track {
  display: flex;
  flex: none;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  animation: marquee-lr var(--duration, 30s) linear infinite;
}

/* ACC-32 : pause au survol, au focus clavier et par le bouton. */
.marquee:hover .marquee-track,
.marquee:focus-within .marquee-track,
.marquee.is-paused .marquee-track { animation-play-state: paused; }

/* ACC-31 : de gauche à droite, la copie prend le relais sans à-coup. */
@keyframes marquee-lr {
  from { transform: translateX(calc(-100% - 16px)); }
  to { transform: translateX(0); }
}

.marquee-track a,
.marquee-track div {
  display: grid;
  place-items: center;
  width: 200px;
  height: 112px;
  padding: 16px 20px;
  background: var(--color-neutral);
  border-radius: var(--radius);
  transition: box-shadow 0.2s ease;
}

.marquee--neutral .marquee-track a,
.marquee--neutral .marquee-track div { background: var(--color-background); }

.marquee-track a:hover { box-shadow: 0 10px 24px color-mix(in srgb, var(--color-secondary) 12%, transparent); }

/* ACC-29 : même hauteur pour tous les logos. */
.marquee-track img {
  width: auto;
  max-width: 100%;
  height: 64px;
  object-fit: contain;
}

.marquee-toggle {
  margin-top: 20px;
  font-size: 0.95rem;
}

.marquee-toggle svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ACC-33 : logos peu nombreux ou animations réduites : grille fixe centrée. */
.marquee.is-static { mask-image: none; }

.marquee.is-static .marquee-track {
  flex: 1 1 auto;
  flex-wrap: wrap;
  justify-content: center;
  animation: none;
}

.marquee.is-static .marquee-track[aria-hidden='true'] { display: none; }

@media (prefers-reduced-motion: reduce) {
  .marquee { mask-image: none; }

  .marquee .marquee-track {
    flex: 1 1 auto;
    flex-wrap: wrap;
    justify-content: center;
  }

  .marquee .marquee-track[aria-hidden='true'],
  .marquee-toggle { display: none; }
}
</style>
