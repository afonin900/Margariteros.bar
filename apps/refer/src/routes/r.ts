import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { schema } from "@refref/coredb";
const { refcode, product, reflink } = schema;
import { eq, and } from "drizzle-orm";
import { normalizeCode } from "@refref/utils";
import type { ProgramConfigV1Type } from "@refref/types";

interface GlobalCodeParams {
  code: string;
}

interface LocalCodeParams {
  productSlug: string;
  code: string;
}

export default async function referralRedirectRoutes(fastify: FastifyInstance) {
  /**
   * Handles GET requests to /r/:code (auto-generated refcodes)
   * Example: /r/abc1234
   *
   * Auto-generated codes are unique across the entire system and don't require product context.
   */
  fastify.get<{ Params: GlobalCodeParams }>(
    "/:code",
    {
      config: {
        rateLimit: {
          max: 100,
          timeWindow: "1 minute",
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: GlobalCodeParams }>,
      reply: FastifyReply,
    ) => {
      try {
        const { code } = request.params;
        const normalizedCode = normalizeCode(code);

        // Single optimized query using relations
        // This does a JOIN under the hood: refcode → participant → program
        const result = await request.db.query.refcode.findFirst({
          where: eq(refcode.code, normalizedCode),
          with: {
            participant: true,
            program: true,
          },
        });

        if (!result || !result.participant) {
          return reply.code(404).send({ error: "Referral code not found" });
        }

        // Get the landing page URL from program config (assuming it's always present)
        const programConfig = result.program!.config as ProgramConfigV1Type;
        const redirectUrl = programConfig.brandConfig!.landingPageUrl;

        if (!redirectUrl) {
          request.log.error({
            kind: "referral_redirect_unconfigured",
            correlationId: request.id,
          }, "Referral redirect failed");
          return reply.code(500).send({
            error: "Landing page URL not configured for this program",
          });
        }

        // A refcode is intentionally the only referral value that leaves RefRef.
        // It is opaque to visitors; names, emails and participant IDs must never
        // be smuggled into a public URL (including as reversible base64 strings).
        const target = new URL(redirectUrl);
        target.searchParams.set("refcode", normalizedCode);

        return reply.code(307).redirect(target.toString());
      } catch {
        request.log.error({
          kind: "referral_redirect_failed",
          correlationId: request.id,
        }, "Referral redirect failed");
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    },
  );

  /**
   * Handles GET requests to /r/:productSlug/:code (vanity links via reflink table)
   * Example: /r/acme/john-doe
   *
   * Vanity links are unique within a product and require the product slug for disambiguation.
   * This allows for vanity URLs like /r/acme/ceo or /r/startup/founder
   */
  fastify.get<{ Params: LocalCodeParams }>(
    "/:productSlug/:code",
    {
      config: {
        rateLimit: {
          max: 100,
          timeWindow: "1 minute",
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: LocalCodeParams }>,
      reply: FastifyReply,
    ) => {
      try {
        const { productSlug, code } = request.params;
        const normalizedCode = normalizeCode(code);

        // First find the product by slug
        const productRecord = await request.db.query.product.findFirst({
          where: eq(product.slug, productSlug),
        });

        if (!productRecord) {
          return reply.code(404).send({ error: "Product not found" });
        }

        // Look up the vanity link in the reflink table
        const reflinkResult = await request.db.query.reflink.findFirst({
          where: and(
            eq(reflink.slug, normalizedCode),
            eq(reflink.productId, productRecord.id),
          ),
          with: {
            refcode: {
              with: {
                participant: true,
                program: true,
              },
            },
          },
        });

        if (
          !reflinkResult ||
          !reflinkResult.refcode ||
          !reflinkResult.refcode.participant
        ) {
          return reply.code(404).send({ error: "Referral link not found" });
        }

        const result = reflinkResult.refcode;

        // Get the landing page URL from program config (assuming it's always present)
        const programConfig = result.program!.config as ProgramConfigV1Type;
        const redirectUrl = programConfig.brandConfig!.landingPageUrl;

        if (!redirectUrl) {
          request.log.error({
            kind: "referral_redirect_unconfigured",
            correlationId: request.id,
          }, "Referral redirect failed");
          return reply.code(500).send({
            error: "Landing page URL not configured for this program",
          });
        }

        const target = new URL(redirectUrl);
        target.searchParams.set("refcode", result.code);

        return reply.code(307).redirect(target.toString());
      } catch {
        request.log.error({
          kind: "referral_redirect_failed",
          correlationId: request.id,
        }, "Referral redirect failed");
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    },
  );
}
