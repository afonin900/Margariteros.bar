import { officialRedirect } from "../../lib/choiceqr/mirror";

export function ALL({ params, request }: { params: { locale?: string; path?: string }; request: Request }) {
  const locale = params.locale;
  if (!locale || !["pl", "en", "ru", "es"].includes(locale)) return new Response("Not found", { status: 404 });
  return officialRedirect(`/${params.path ?? ""}`, new URL(request.url));
}
