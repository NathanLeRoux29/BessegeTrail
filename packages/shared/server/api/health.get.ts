// Endpoint de santé commun au site et à l'admin (healthcheck Docker, surveillance).
export default defineEventHandler(event => healthPayload(useRuntimeConfig(event).appName))
