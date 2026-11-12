<script lang="ts">
import type { PropType } from 'vue'
import type { NuxtLinkProps } from '#app'

// Trois variantes, et aucune autre (THM-03). Le contour prend la couleur du texte
// qui l'entoure : il sert sur fond clair comme sur fond vert.
const variants = ['primary', 'secondary', 'outline'] as const

export type ButtonVariant = typeof variants[number]

export function isButtonVariant(value: unknown): value is ButtonVariant {
  return variants.includes(value as ButtonVariant)
}
</script>

<script setup lang="ts">
defineProps({
  variant: { type: String as PropType<ButtonVariant>, default: 'primary', validator: isButtonVariant },
  // Destination : rend un lien. Sans destination : un bouton.
  to: { type: [String, Object] as PropType<NuxtLinkProps['to']>, default: undefined },
  type: { type: String as PropType<'button' | 'submit'>, default: 'button' },
})
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="['button', `button--${variant}`]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :class="['button', `button--${variant}`]"
  >
    <slot />
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px; /* cible tactile de 44 px minimum */
  padding: 12px 26px;
  font-family: var(--font-title);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-decoration: none;
  text-transform: uppercase;
  border: 2px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.button:hover { transform: translateY(-2px); }

/* Orange, texte vert : jamais de texte clair sur l'orange. */
.button--primary {
  color: var(--color-secondary);
  background: var(--color-primary);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.button--secondary {
  color: var(--color-background);
  background: var(--color-secondary);
}

.button--outline {
  color: inherit;
  background: transparent;
  border-color: currentColor;
}

.button--outline:hover { background: color-mix(in srgb, currentColor 12%, transparent); }
</style>
