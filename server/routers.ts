import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const hospitalInput = z.object({
  name: z.string(),
  rating: z.number(),
  reviews: z.number(),
  capacity: z.number(),
  speciality: z.string(),
  emergencyLevel: z.string(),
  openNow: z.boolean(),
  address: z.string(),
  feedback: z.string(),
  reviewHighlight: z.string(),
  distanceKm: z.number().nonnegative(),
  etaMinutes: z.number().int().nonnegative(),
});

const recommendationSchema = {
  name: "hospital_recommendation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      selectedHospital: { type: "string" },
      confidence: { type: "number" },
      summary: { type: "string" },
      reasons: { type: "array", items: { type: "string" } },
      rankedHospitals: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            reason: { type: "string" },
          },
          required: ["name", "reason"],
          additionalProperties: false,
        },
      },
    },
    required: ["selectedHospital", "confidence", "summary", "reasons", "rankedHospitals"],
    additionalProperties: false,
  },
} as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  hospital: router({
    recommend: publicProcedure
      .input(z.object({ driverPlace: z.string(), hospitals: z.array(hospitalInput).min(1) }))
      .mutation(async ({ input }) => {
        const ranked = [...input.hospitals].sort((a, b) => {
          const score = (hospital: typeof a) =>
            (hospital.openNow ? 25 : -60) +
            (hospital.emergencyLevel.includes("Level 1") ? 24 : 14) +
            hospital.rating * 10 +
            Math.min(16, Math.log10(Math.max(10, hospital.reviews)) * 4) +
            hospital.capacity * 0.12 -
            hospital.distanceKm * 5 -
            hospital.etaMinutes * 1.2;
          return score(b) - score(a);
        });
        const fallback = {
          selectedHospital: ranked[0].name,
          confidence: Math.min(0.97, Math.max(0.72, 0.9 - ranked[0].distanceKm / 100)),
          summary: `${ranked[0].name} is the strongest current option from ${input.driverPlace}, balancing emergency readiness, estimated arrival time, available capacity, and verified feedback.`,
          reasons: [
            `${ranked[0].distanceKm.toFixed(1)} km estimated from the current driver location`,
            `${ranked[0].etaMinutes} min urban travel estimate`,
            `${ranked[0].rating.toFixed(1)}★ from ${ranked[0].reviews.toLocaleString()} reviews with ${ranked[0].feedback.toLowerCase()}`,
          ],
          rankedHospitals: ranked.map((hospital, index) => ({
            name: hospital.name,
            reason: index === 0 ? "Recommended balance of speed, emergency readiness, capacity, and feedback" : `${hospital.distanceKm.toFixed(1)} km · ${hospital.etaMinutes} min · ${hospital.rating.toFixed(1)}★`,
          })),
        };

        try {
          const response = await invokeLLM({
            model: "gpt-4o-mini",
            maxTokens: 500,
            messages: [
              { role: "system", content: "You are a hospital-dispatch decision assistant for an ambulance captain. Choose the safest practical destination. Never invent facts. Use only the supplied metrics. Prefer emergency capability and open status, then minimize ETA and distance, while considering capacity, ratings, review volume, and feedback. Return concise operational language." },
              { role: "user", content: JSON.stringify({ driverPlace: input.driverPlace, hospitals: ranked }) },
            ],
            response_format: { type: "json_schema", json_schema: recommendationSchema },
          });
          const content = response.choices?.[0]?.message?.content;
          const parsed = typeof content === "string" ? JSON.parse(content) : null;
          if (parsed?.selectedHospital && Array.isArray(parsed.reasons)) return parsed;
        } catch (error) {
          console.warn("AI hospital recommendation unavailable; using deterministic dispatch ranking", error);
        }
        return fallback;
      }),
  }),
});

export type AppRouter = typeof appRouter;
