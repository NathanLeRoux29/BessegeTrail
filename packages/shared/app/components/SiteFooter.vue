<script setup lang="ts">
import type { PropType } from 'vue'
import type { BlockContent } from '#bessege/content/blocks'

// Footer du site (SOC-06, SOC-07), aussi rendu par l'aperçu de l'admin : le
// contenu arrive par props. Un champ vide n'est pas affiché.
const props = defineProps({
  settings: { type: Object as PropType<BlockContent<'settings'>>, required: true },
  footer: { type: Object as PropType<BlockContent<'footer'>>, required: true },
  // Logo et titre, repris du header.
  header: { type: Object as PropType<BlockContent<'header'>>, required: true },
})

const dateAndPlace = computed(() => [props.settings.dateLabel, props.settings.place].filter(Boolean).join(' · '))
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="footer-grid">
        <div>
          <NuxtLink
            class="brand"
            to="/"
          >
            <!-- Décoratif : le titre à côté nomme déjà le lien. -->
            <img
              v-if="header.logo.src"
              :src="header.logo.src"
              alt=""
              width="44"
              height="44"
            >
            <span>{{ header.title }}</span>
          </NuxtLink>
          <p
            v-if="dateAndPlace"
            class="footer-date"
          >
            {{ dateAndPlace }}
          </p>
          <SocialLinks
            :socials="settings.socials"
            :event-name="settings.eventName"
          />
        </div>

        <div
          v-if="footer.association || settings.email"
          class="footer-contact"
        >
          <h2>Contact</h2>
          <ul>
            <li v-if="footer.association">
              {{ footer.association }}
            </li>
            <li v-if="settings.email">
              <a :href="`mailto:${settings.email}`">{{ settings.email }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h2>Informations</h2>
          <ul>
            <li>
              <NuxtLink to="/mentions-legales">
                Mentions légales
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/confidentialite">
                Politique de confidentialité
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <span
          v-if="footer.text"
          class="footer-text"
        >{{ footer.text }}</span>
        <span>Site sans cookie</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 56px 0 28px;
  color: var(--color-background);
  background: var(--color-secondary);
}

.site-footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--gutter);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 32px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand img { width: 44px; height: 44px; }

.brand span {
  font-family: var(--font-title);
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.site-footer .socials { margin-top: 16px; }

.site-footer h2 {
  margin: 0 0 14px;
  font-size: 1.3rem;
  letter-spacing: 0.08em;
  color: var(--color-background);
}

.site-footer ul:not(.socials) {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-footer a {
  color: var(--color-background);
  text-underline-offset: 3px;
}

.site-footer a:hover { color: var(--color-primary); }

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  font-size: 0.9rem;
  border-top: 1px solid color-mix(in srgb, var(--color-background) 15%, transparent);
}

@media (max-width: 760px) {
  .footer-grid { grid-template-columns: 1fr; }

  /* SOC-11 : cibles tactiles de 44 px de haut. */
  .site-footer ul:not(.socials) { gap: 0; }

  .site-footer ul:not(.socials) a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
  }
}
</style>
