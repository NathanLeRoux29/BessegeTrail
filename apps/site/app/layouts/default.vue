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
    <SiteHeader
      :header="published.header"
      :register-url="published.settings.registerUrl"
      :hidden-targets="hiddenTargets"
    />
    <slot />
    <SiteFooter
      :settings="published.settings"
      :footer="published.footer"
      :header="published.header"
    />
  </div>
</template>
