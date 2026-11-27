<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'
import type { SectionBackground } from '#bessege/content/sections'

// Section Contact de l'accueil (ACC-30) : texte d'introduction, e-mail de contact
// et réseaux sociaux, tous deux repris des paramètres généraux.
defineProps({
  block: { type: Object as PropType<BlockContent<'home.contact'>>, required: true },
  settings: { type: Object as PropType<BlockContent<'settings'>>, required: true },
  anchor: { type: String, required: true },
  background: { type: String as PropType<SectionBackground>, default: 'background' },
})
</script>

<template>
  <PageSection
    :anchor="anchor"
    :title="block.title"
    :background="background"
    :intro="block.text"
    eyebrow="Une question ?"
    centered
  >
    <a
      v-if="settings.email"
      class="contact-mail"
      :href="`mailto:${settings.email}`"
    >{{ settings.email }}</a>
    <SocialLinks
      class="contact-socials"
      :socials="settings.socials"
      :event-name="settings.eventName"
    />
  </PageSection>
</template>

<style scoped>
.contact-mail {
  /* SOC-11 : cible de 44 px de haut, même quand la police rapetisse sur mobile. */
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--font-title);
  font-size: clamp(1.6rem, 4vw, 2.6rem);
  font-weight: 800;
  color: var(--color-secondary);
  overflow-wrap: anywhere;
  text-decoration-color: var(--color-primary);
  text-decoration-thickness: 3px;
  text-underline-offset: 8px;
}

.contact-socials {
  justify-content: center;
  margin-top: 28px;
  color: var(--color-secondary);
}
</style>
