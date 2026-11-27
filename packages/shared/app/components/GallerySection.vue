<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'
import type { SectionBackground } from '#bessege/content/sections'

// Galerie de l'accueil (ACC-21 à ACC-23) : photos en grille ; un clic ouvre la
// visionneuse, une boîte de dialogue modale native (showModal) : le reste de la
// page est inerte, le focus y reste piégé et Échap la ferme. Les flèches font
// défiler les photos ; à la fermeture, le focus revient à la miniature.
const props = defineProps({
  block: { type: Object as PropType<BlockContent<'home.galerie'>>, required: true },
  anchor: { type: String, required: true },
  background: { type: String as PropType<SectionBackground>, default: 'background' },
})

const photos = computed(() => props.block.photos.filter(photo => photo.src))
const current = ref(0)
const photo = computed(() => photos.value[current.value])

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const thumbnails = useTemplateRef<HTMLButtonElement[]>('thumbnails')

// Miniature qui a ouvert la visionneuse, qui retrouve le focus à la fermeture.
let opener = 0

function open(index: number) {
  opener = index
  current.value = index
  dialog.value?.showModal()
}

function close() {
  dialog.value?.close()
}

function move(step: number) {
  current.value = (current.value + step + photos.value.length) % photos.value.length
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') move(1)
  if (event.key === 'ArrowLeft') move(-1)
  if (event.key === 'Tab') trapFocus(event)
}

// La boîte modale native laisse Tab sortir vers l'interface du navigateur après
// le dernier bouton : le focus boucle entre ses boutons (ACC-22).
function trapFocus(event: KeyboardEvent) {
  const buttons = [...(dialog.value?.querySelectorAll('button') ?? [])]
  const first = buttons[0]
  const last = buttons.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

// Fermeture par Échap ou par le bouton : le focus revient à la miniature cliquée.
function onClose() {
  thumbnails.value?.[opener]?.focus()
}
</script>

<template>
  <PageSection
    :anchor="anchor"
    :title="block.title"
    :background="background"
    eyebrow="En images"
  >
    <ul class="gallery">
      <li
        v-for="(item, index) in photos"
        :key="index"
      >
        <button
          ref="thumbnails"
          type="button"
          :aria-label="`Agrandir : ${item.alt}`"
          @click="open(index)"
        >
          <ResponsiveImage
            v-bind="item"
            :sizes="index % 6 === 0 ? '(max-width: 640px) 100vw, 66vw' : '(max-width: 640px) 50vw, 33vw'"
          />
        </button>
      </li>
    </ul>

    <dialog
      ref="dialog"
      class="lightbox"
      aria-label="Visionneuse de photos"
      @keydown="onKeydown"
      @close="onClose"
    >
      <figure v-if="photo">
        <ResponsiveImage
          :key="current"
          v-bind="photo"
          sizes="min(96vw, 1100px)"
        />
        <figcaption>
          <span class="caption">{{ photo.alt }} ({{ current + 1 }}/{{ photos.length }})</span>
          <span class="lightbox-nav">
            <AppButton
              variant="outline"
              @click="move(-1)"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              ><path d="M15 6l-6 6 6 6" /></svg>
              <span class="visually-hidden">Photo précédente</span>
            </AppButton>
            <AppButton
              variant="outline"
              @click="move(1)"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              ><path d="M9 6l6 6-6 6" /></svg>
              <span class="visually-hidden">Photo suivante</span>
            </AppButton>
            <AppButton
              variant="outline"
              @click="close"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              ><path d="M6 6l12 12M18 6 6 18" /></svg>
              <span class="visually-hidden">Fermer</span>
            </AppButton>
          </span>
        </figcaption>
      </figure>
    </dialog>
  </PageSection>
</template>

<style scoped>
/* ACC-21 : grille, la première photo de chaque série de six en grand. */
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gallery li:nth-child(6n + 1) {
  grid-row: span 2;
  grid-column: span 2;
}

@media (max-width: 640px) {
  .gallery { grid-template-columns: repeat(2, 1fr); }

  .gallery li:nth-child(6n + 1) { grid-row: auto; }
}

.gallery button {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  cursor: zoom-in;
  background: var(--color-neutral);
  border: 0;
  border-radius: var(--radius);
}

.gallery img {
  width: 100%;
  height: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.gallery button:hover img { transform: scale(1.05); }

.lightbox {
  width: min(96vw, 1100px);
  max-height: 92vh;
  padding: 0;
  color: var(--color-background);
  background: var(--color-secondary);
  border: 0;
  border-radius: var(--radius);
}

.lightbox::backdrop { background: color-mix(in srgb, var(--color-secondary) 90%, transparent); }

.lightbox figure { margin: 0; }

.lightbox img {
  width: 100%;
  max-height: 78vh;
  object-fit: contain;
  background: var(--color-text);
}

.lightbox figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
}

.lightbox-nav {
  display: flex;
  gap: 8px;
}

/* Boutons d'icône : le bouton contour, resserré autour de l'icône. */
.lightbox-nav .button { padding: 12px; }

.lightbox-nav svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
