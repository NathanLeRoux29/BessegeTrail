<script setup lang="ts">
import { hiddenMenuTargets } from '#bessege/content/menu'

// Éléments communs à toutes les pages, à partir du contenu publié.
const { data: content } = await usePublishedContent()
if (!content.value) throw createError({ statusCode: 503, statusMessage: 'Contenu indisponible', fatal: true })
const published = content.value
const hiddenTargets = hiddenMenuTargets(published)
</script>

<template>
  <div class="site-layout">
    <!-- SOC-16 : premier élément focusable, il saute le header. -->
    <a
      class="skip-link"
      href="#contenu"
    >Aller au contenu</a>
    <SiteHeader
      :header="published.header"
      :register-url="published.settings.registerUrl"
      :hidden-targets="hiddenTargets"
    />
    <!-- Cible du lien d'évitement : chaque page rend son contenu ici. -->
    <main
      id="contenu"
      tabindex="-1"
    >
      <slot />
    </main>
    <SiteFooter
      :settings="published.settings"
      :footer="published.footer"
      :header="published.header"
    />
  </div>
</template>

<style scoped>
/* Hors de l'écran, il apparaît en haut à gauche quand il reçoit le focus. */
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  z-index: 100;
  padding: 12px 20px;
  font-weight: 700;
  color: var(--color-secondary);
  background: var(--color-primary);
  border-radius: 0 0 var(--radius) var(--radius);
}

.skip-link:focus { top: 0; }

/* Cible d'un saut, pas un élément interactif : pas de contour. */
main:focus { outline: none; }
</style>
