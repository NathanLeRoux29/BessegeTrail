<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'

// Header du site (SOC-01 à SOC-05), aussi rendu par l'aperçu de l'admin : le
// contenu arrive par props, publié sur le site, brouillon dans l'aperçu.
const props = defineProps({
  header: { type: Object as PropType<BlockContent<'header'>>, required: true },
  // Lien d'inscription général des paramètres, si le bouton n'a pas le sien.
  registerUrl: { type: String, default: '' },
  // Cibles des sections et épreuves masquées (hiddenMenuTargets, SOC-03).
  hiddenTargets: { type: Array as PropType<string[]>, default: () => [] },
})

const items = computed(() => props.header.menu.filter(item => !props.hiddenTargets.includes(item.target)))
// Sans aucun lien, pas de bouton d'inscription.
const ctaUrl = computed(() => props.header.cta.url || props.registerUrl)
const isExternal = (target: string) => /^(https|mailto):/.test(target)

// Menu replié sur petit écran (SOC-04).
const navId = useId()
const nav = useTemplateRef<HTMLElement>('nav')
const toggle = useTemplateRef<HTMLButtonElement>('toggle')
const open = ref(false)

async function toggleMenu() {
  open.value = !open.value
  if (!open.value) return
  await nextTick()
  nav.value?.querySelector('a')?.focus()
}

function closeMenu() {
  open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  closeMenu()
  toggle.value?.focus()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink
        class="brand"
        to="/"
      >
        <img
          v-if="header.logo.src"
          :src="header.logo.src"
          :alt="header.logo.alt"
          width="44"
          height="44"
        >
        <span>{{ header.title }}</span>
      </NuxtLink>

      <button
        ref="toggle"
        class="menu-toggle"
        type="button"
        :aria-expanded="open"
        :aria-controls="navId"
        @click="toggleMenu"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        ><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        <span class="menu-toggle__label">Menu</span>
      </button>

      <nav
        :id="navId"
        ref="nav"
        :class="['main-nav', { 'is-open': open }]"
        aria-label="Navigation principale"
      >
        <ul>
          <li
            v-for="(item, index) in items"
            :key="index"
          >
            <a
              v-if="isExternal(item.target)"
              :href="item.target"
              target="_blank"
              rel="noopener"
              @click="closeMenu"
            >{{ item.label }}<span class="visually-hidden"> (nouvel onglet)</span></a>
            <NuxtLink
              v-else
              :to="item.target"
              @click="closeMenu"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <AppButton
        v-if="ctaUrl"
        class="header-cta"
        :to="ctaUrl"
        target="_blank"
        rel="noopener"
      >
        {{ header.cta.label }}<span class="visually-hidden"> (nouvel onglet)</span>
      </AppButton>
    </div>
  </header>
</template>

<style scoped>
/* SOC-05 : le header reste en haut de l'écran. */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  color: var(--color-background);
  background: var(--color-secondary);
  box-shadow: 0 2px 16px color-mix(in srgb, var(--color-secondary) 25%, transparent);
}

.site-header__inner {
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: 1200px;
  min-height: var(--header-height);
  margin: 0 auto;
  padding: 0 var(--gutter);
}

.brand {
  display: flex;
  /* Sur un écran étroit, le titre passe sur deux lignes (SOC-10). */
  flex: 0 1 auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 44px;
  color: inherit;
  text-decoration: none;
}

.brand img { flex: none; width: 44px; height: 44px; }

.brand span {
  overflow-wrap: anywhere;
  font-family: var(--font-title);
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.main-nav { margin-left: auto; }

.main-nav ul {
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.main-nav a {
  display: block;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-background);
  text-decoration: none;
  border-radius: 6px;
}

.main-nav a:hover { background: color-mix(in srgb, var(--color-background) 10%, transparent); }

.header-cta {
  flex: none;
  min-height: 44px;
  padding: 8px 20px;
  font-size: 1.05rem;
  box-shadow: none;
}

.menu-toggle {
  display: none;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  margin-left: auto;
  padding: 8px 14px;
  font: 600 0.95rem var(--font-text);
  color: var(--color-background);
  cursor: pointer;
  background: transparent;
  border: 2px solid color-mix(in srgb, var(--color-background) 40%, transparent);
  border-radius: 999px;
}

.menu-toggle svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}

/* SOC-04 : menu replié sous 1080 px, seuil où il ne tient plus sur une ligne. */
@media (max-width: 1080px) {
  .menu-toggle { display: inline-flex; }

  .main-nav {
    position: absolute;
    inset: 100% 0 auto 0;
    display: none;
    margin: 0;
    padding: 8px var(--gutter) 24px;
    background: var(--color-secondary);
    border-top: 1px solid color-mix(in srgb, var(--color-background) 15%, transparent);
  }

  .main-nav.is-open { display: block; }

  .main-nav ul { flex-direction: column; }

  .main-nav a {
    padding: 14px 8px;
    font-size: 1.1rem;
    border-bottom: 1px solid color-mix(in srgb, var(--color-background) 10%, transparent);
    border-radius: 0;
  }
}

@media (max-width: 520px) {
  .site-header__inner { gap: 10px; }

  .brand span { font-size: 1.15rem; }

  .brand img { width: 36px; height: 36px; }

  .header-cta { padding: 8px 14px; font-size: 0.95rem; }

  /* Libellé lu par les lecteurs d'écran, seule l'icône reste visible. */
  .menu-toggle__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

/* Très petits écrans (320 px) : tout tient sur une ligne sans couper le titre. */
@media (max-width: 359px) {
  .site-header__inner { gap: 8px; }

  .brand { gap: 8px; }

  .brand span { font-size: 1rem; }

  .header-cta { padding: 8px 12px; }
}
</style>
