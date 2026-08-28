import { createHmac } from "node:crypto";

const webapp = process.env.REFREF_WEBAPP_URL ?? "http://localhost:3000";
const api = process.env.REFREF_API_URL ?? "http://localhost:3001";
const refer = process.env.REFREF_REFER_URL ?? "http://localhost:3002";
const refcode = process.env.MARGARITEROS_STAGING_REFCODE ?? "x7mq2ka";
const token =
  process.env.TELEGRAM_CLUB_BOT_TOKEN ??
  "local-only-test-token-not-for-production";

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function json(url, init) {
  const response = await fetch(url, init);
  return { response, body: await response.json() };
}

function signedInitData() {
  const values = {
    auth_date: String(Math.floor(Date.now() / 1_000)),
    query_id: "local-staging-verification",
    user: JSON.stringify({ id: 123456 }),
  };
  const dataCheckString = Object.entries(values)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  const hash = createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");
  return new URLSearchParams({ ...values, hash }).toString();
}

const apiReady = await json(`${api}/health`);
expect(apiReady.response.ok, "RefRef API health is not ready");
expect(
  apiReady.body.checks?.database?.status === "ready",
  "API database check is not ready",
);
expect(
  apiReady.body.checks?.syrveAdapter?.status === "not_ready",
  "Syrve must remain not_ready in local staging",
);

const webReady = await json(`${webapp}/api/ready`);
expect(webReady.response.ok, "Webapp readiness is not ready");
expect(webReady.body.checks?.ui?.status === "ready", "UI check is not ready");
expect(
  webReady.body.checks?.database?.status === "ready",
  "Webapp database check is not ready",
);
expect(
  webReady.body.checks?.refrefApi?.status === "ready",
  "Webapp RefRef API check is not ready",
);
expect(
  webReady.body.checks?.syrveAdapter?.status === "not_ready",
  "Webapp Syrve must remain not_ready",
);

const portal = await fetch(`${webapp}/club`);
expect(portal.ok, "R Club browser portal did not render");
expect(
  (await portal.text()).includes("R Club"),
  "R Club portal surface is missing",
);

const referral = await fetch(`${refer}/${refcode}`, { redirect: "manual" });
expect(
  referral.status === 307,
  "Opaque refcode did not produce a temporary redirect",
);
const referralTarget = referral.headers.get("location") ?? "";
expect(
  referralTarget.includes(`/club?refcode=${refcode}`),
  "Referral target does not preserve only the opaque refcode",
);

const initData = signedInitData();
const telegramRequest = () =>
  json(`${webapp}/api/club/telegram/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData }),
  });
const firstTelegram = await telegramRequest();
const replayTelegram = await telegramRequest();
expect(
  firstTelegram.response.status === 200,
  "Signed Telegram launch was not accepted once",
);
expect(
  firstTelegram.body.status === "verified_pending_registration",
  "Telegram accepted an unexpected state",
);
expect(
  replayTelegram.response.status === 409,
  "PostgreSQL replay guard did not reject the duplicate launch",
);
expect(
  replayTelegram.body.status === "replay_detected",
  "Duplicate Telegram launch has an unexpected state",
);

console.log(
  JSON.stringify({
    api: "ready",
    webapp: "ready",
    portal: "rendered",
    referral: "opaque_refcode_redirected",
    telegram: "atomic_replay_rejected",
    syrveAdapter: "not_ready",
  }),
);
