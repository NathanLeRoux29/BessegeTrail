<script setup lang="ts">
import { countdown } from '#bessege/content/countdown'

// Compte à rebours de la bannière (ACC-07 à ACC-10). Calculé au rendu serveur,
// visible sans JavaScript ; l'heure de ce rendu est reprise par le client à
// l'hydratation (pas d'écart), puis le compte est mis à jour chaque minute.
const props = defineProps({
  // Date et heure de départ des paramètres, heure de Paris. Vide : rien n'est affiché.
  startDate: { type: String, required: true },
  // Texte qui remplace le compte à rebours une fois le départ passé (ACC-10).
  afterText: { type: String, required: true },
})

const now = useState('countdown-now', () => Date.now())
const remaining = computed(() => props.startDate ? countdown(props.startDate, new Date(now.value)) : null)

// Texte lu par les lecteurs d'écran : il ne change qu'une fois par jour et n'est
// pas une zone annoncée (ACC-09).
const spoken = computed(() => {
  const days = remaining.value?.days ?? 0
  if (days === 0) return 'Départ dans moins d’un jour'
  return `Départ dans ${days} ${days > 1 ? 'jours' : 'jour'}`
})

let timeout: ReturnType<typeof setTimeout> | undefined
let interval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  now.value = Date.now()
  // Première mise à jour au changement de minute, puis toutes les minutes.
  timeout = setTimeout(() => {
    now.value = Date.now()
    interval = setInterval(() => (now.value = Date.now()), 60_000)
  }, 60_000 - (now.value % 60_000))
})

onBeforeUnmount(() => {
  clearTimeout(timeout)
  clearInterval(interval)
})
</script>

<template>
  <div
    v-if="startDate"
    class="hero-countdown"
  >
    <div
      v-if="remaining"
      class="countdown"
    >
      <span
        class="countdown-label"
        aria-hidden="true"
      >Départ dans</span>
      <p class="visually-hidden">
        {{ spoken }}
      </p>
      <div
        class="countdown-boxes"
        aria-hidden="true"
      >
        <div class="countdown-box">
          <strong>{{ remaining.days }}</strong>{{ ' ' }}<span>jours</span>
        </div>
        <div class="countdown-box">
          <strong>{{ remaining.hours }}</strong>{{ ' ' }}<span>heures</span>
        </div>
        <div class="countdown-box">
          <strong>{{ remaining.minutes }}</strong>{{ ' ' }}<span>minutes</span>
        </div>
      </div>
    </div>
    <p
      v-else
      class="countdown-after"
    >
      {{ afterText }}
    </p>
  </div>
</template>

<style scoped>
.hero-countdown { margin-top: 18px; }

.countdown {
  display: grid;
  gap: 10px;
}

.countdown p { margin: 0; }

.countdown-label {
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.countdown-boxes {
  display: flex;
  gap: 10px;
}

.countdown-box {
  min-width: 92px;
  padding: 14px 10px 10px;
  text-align: center;
  background: color-mix(in srgb, var(--color-secondary) 45%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-background) 35%, transparent);
  border-radius: var(--radius);
  backdrop-filter: blur(6px);
}

.countdown-box strong {
  display: block;
  font-family: var(--font-title);
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}

.countdown-box span {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.countdown-after {
  margin: 0;
  font-family: var(--font-title);
  font-size: 1.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

@media (max-width: 520px) {
  .countdown-box {
    flex: 1;
    min-width: 0;
  }

  .countdown-box strong { font-size: 2.3rem; }
}
</style>
