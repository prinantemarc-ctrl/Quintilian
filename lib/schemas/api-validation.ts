import { z } from "zod"

export const BaseAnalysisSchema = z.object({
  message: z.string().optional().default(""),
  language: z.string().optional().default("fr"),
  country: z.string().optional(),
})

export const SingleAnalysisSchema = BaseAnalysisSchema.extend({
  brand: z.string().min(1, "Le nom/brand est requis"),
  selected_identity: z.string().optional(),
  search_results: z
    .array(
      z.object({
        title: z.string().optional(),
        link: z.string().optional(),
        snippet: z.string().optional(),
      }),
    )
    .optional(),
})

export const DuelAnalysisSchema = BaseAnalysisSchema.extend({
  brand1: z.string().min(1, "Le premier nom est requis"),
  brand2: z.string().min(1, "Le second nom est requis"),
})

export const WorldReputationSchema = BaseAnalysisSchema.extend({
  brand: z.string().min(1, "Le nom/brand est requis"),
  countries: z.array(z.string()).min(1, "Au moins un pays est requis"),
})

export const PressSearchSchema = BaseAnalysisSchema.extend({
  brand: z.string().min(1, "Le nom/brand est requis"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  countries: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  maxResults: z.number().min(1).max(50).default(20),
})

export const PressComparisonSchema = BaseAnalysisSchema.extend({
  brand1: z.string().min(1, "Le premier nom est requis"),
  brand2: z.string().min(1, "Le second nom est requis"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  countries: z.array(z.string()).optional(),
})

export type SingleAnalysisRequest = z.infer<typeof SingleAnalysisSchema>
export type DuelAnalysisRequest = z.infer<typeof DuelAnalysisSchema>
export type WorldReputationRequest = z.infer<typeof WorldReputationSchema>
export type PressSearchRequest = z.infer<typeof PressSearchSchema>
export type PressComparisonRequest = z.infer<typeof PressComparisonSchema>
