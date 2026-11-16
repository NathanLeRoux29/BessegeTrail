<script setup lang="ts">
// Image du contenu (SOC-12, SOC-18), utilisée par toutes les sections. Une photo
// envoyée est déclinée en WebP en 480, 960 et 1600 px (CNT-19) : `src` désigne
// la version 960, le srcset en déduit les deux autres. Les autres images (logos
// SVG…) sont servies telles quelles. Sans source, rien n'est affiché.
const props = defineProps({
  src: { type: String, required: true },
  // Obligatoire : "" pour une image décorative (SOC-18).
  alt: { type: String, required: true },
  // Dimensions de la plus grande version ; 0 = inconnues, attributs omis.
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  // Largeur d'affichage, pour que le navigateur choisisse la bonne version.
  sizes: { type: String, default: '100vw' },
  // Bannière seulement : chargée tout de suite, en priorité haute.
  priority: { type: Boolean, default: false },
})

const variant = /-960\.webp$/

const srcset = computed(() => variant.test(props.src)
  ? [480, 960, 1600].map(width => `${props.src.replace(variant, `-${width}.webp`)} ${width}w`).join(', ')
  : undefined)
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :srcset="srcset"
    :sizes="srcset ? sizes : undefined"
    :alt="alt ?? ''"
    :width="width || undefined"
    :height="height || undefined"
    :loading="priority ? undefined : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    decoding="async"
  >
</template>
