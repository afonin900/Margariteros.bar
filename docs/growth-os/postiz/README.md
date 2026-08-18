# Postiz Self-Hosted

Live: https://postiz.margariteros.bar

- Upstream compose: `gitroomhq/postiz-docker-compose@dd4969e`
- App: `ghcr.io/gitroomhq/postiz-app:v2.23.0`
- Dokploy project: `postiz` (не `margariteros`, не `hermes-core`)
- Secrets: OpenBao `secret/projects/margariteros/postiz` (не Git)
- Media: named volume `postiz-uploads` (R2 не было)
- Pinterest: слоты `PINTEREST_CLIENT_ID` / `PINTEREST_CLIENT_SECRET`. Один App → много аккаунтов через OAuth.
- Callback: `https://postiz.margariteros.bar/integrations/social/pinterest`

Регистрация пока открыта. После первого аккаунта: `DISABLE_REGISTRATION=true` и redeploy.
