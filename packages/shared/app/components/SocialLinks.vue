<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'

type Socials = BlockContent<'settings'>['socials']

// Liens vers les réseaux sociaux renseignés (SOC-07), dans le footer et la
// section Contact. Un réseau sans URL n'est pas affiché.
const props = defineProps({
  socials: { type: Object as PropType<Socials>, required: true },
  // Nom de l'événement, pour le nom accessible de chaque icône.
  eventName: { type: String, required: true },
})

const networks = [
  { key: 'facebook', name: 'Facebook', icon: 'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z' },
  { key: 'instagram', name: 'Instagram', icon: 'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM17.5 6.5h.01' },
  { key: 'strava', name: 'Strava', icon: 'm10 3-6 12h4l2-4 2 4h4L10 3ZM15 15l-2 4 2 2 2-2-2-4Z' },
  { key: 'youtube', name: 'YouTube', icon: 'M6.5 5.5h11a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4h-11a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4ZM10 9l5 3-5 3V9Z' },
] as const

const links = computed(() => networks
  .filter(network => props.socials[network.key])
  .map(network => ({ ...network, url: props.socials[network.key] })))
</script>

<template>
  <ul
    v-if="links.length"
    class="socials"
  >
    <li
      v-for="link in links"
      :key="link.key"
    >
      <a
        :href="link.url"
        target="_blank"
        rel="noopener"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path :d="link.icon" /></svg>
        <span class="visually-hidden">{{ link.name }} du {{ eventName }} (nouvel onglet)</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.socials {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.socials a {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  color: inherit;
  background: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 999px;
  transition: transform 0.15s ease;
}

.socials a:hover { transform: translateY(-3px); }

.socials svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
