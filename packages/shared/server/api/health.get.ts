// Endpoint de santé commun au site et à l'admin (healthcheck Docker, surveillance),
// avec la version déployée (DEP-13).
export default defineEventHandler((event) => {
  const { appName, appVersion } = useRuntimeConfig(event)
  return healthPayload(appName, appVersion)
})
