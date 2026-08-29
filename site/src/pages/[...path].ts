import { officialRedirect } from "../lib/choiceqr/redirect";

const ACTIONS = new Set([
  "booking", "delivery-areas", "feedback", "search", "menu", "takeaway", "delivery",
  "cookie-policy", "terms-of-use", "privacy-policy", "allergens", "section:menu",
  "section:cocktails", "section:chupitos", "section:cervezas", "section:napoje-alkoholowe",
  "section:agave-spirits", "section:napoje",
]);

export function ALL({ params, request }: { params: { path?: string }; request: Request }) {
  const path = params.path ?? "";
  if (!ACTIONS.has(path)) return new Response("Not found", { status: 404 });
  return officialRedirect(`/${path}`, new URL(request.url));
}
