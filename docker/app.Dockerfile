# syntax=docker/dockerfile:1
# Image d'une app Nuxt du monorepo (site ou admin). À construire depuis la racine :
#   docker build --file docker/app.Dockerfile --build-arg APP=site --tag bessege/site .
ARG NODE_IMAGE=node:24-alpine

# 1. Dépendances et compilation
FROM ${NODE_IMAGE} AS build
ARG APP
RUN test "$APP" = site || test "$APP" = admin || { echo "APP doit valoir site ou admin" >&2; exit 1; }
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# Téléchargement des dépendances à partir du seul lockfile : couche mise en cache
# tant que les dépendances ne changent pas.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store pnpm fetch

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline
RUN pnpm --filter "@bessege/${APP}" build

# 2. Image finale : uniquement l'app compilée (.output contient ses dépendances)
FROM ${NODE_IMAGE} AS runtime
ARG APP
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
# Fichiers appartenant à root, en lecture seule pour l'utilisateur node.
COPY --from=build /repo/apps/${APP}/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1
CMD ["node", ".output/server/index.mjs"]
