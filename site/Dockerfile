FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build

COPY . ./
RUN npm run build

FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
RUN addgroup -S astro && adduser -S astro -G astro
RUN mkdir -p /app/data/backups /app/node_modules/.astro/sessions \
    && chown -R astro:astro /app/data /app/node_modules/.astro
COPY --from=build --chown=astro:astro /app/dist ./dist
# Operational artifacts only: the checked seed input and migrations. They
# contain no environment values or credentials.
COPY --from=build --chown=astro:astro /app/.emdash/seed.json ./.emdash/seed.json
COPY --from=build --chown=astro:astro /app/scripts/migrate-native-i18n.mjs ./scripts/migrate-native-i18n.mjs
COPY --from=build --chown=astro:astro /app/scripts/migrate-homepage-gallery.mjs ./scripts/migrate-homepage-gallery.mjs
COPY --from=build --chown=astro:astro /app/scripts/migrate-shared-fields.mjs ./scripts/migrate-shared-fields.mjs
COPY --from=build --chown=astro:astro /app/scripts/seed-staging-editorial-content.mjs ./scripts/seed-staging-editorial-content.mjs
USER astro
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4321/healthz').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "./dist/server/entry.mjs"]
