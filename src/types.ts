import type { gateway as gatewayFn } from 'ai'

export type ModelType = 'generateText' | 'generateImage'

export interface ModelConfig {
  id: string // Vercel AI Gateway model ID (e.g. 'google/gemini-2.5-flash-image')
  name: string // Human-readable name
  type: ModelType // Which SDK function to use
  provider: string // Provider display name
  notes?: string
  // Set to true for models that use `size` (e.g. '1024x1024') instead of `aspectRatio`.
  // Recraft and OpenAI models fall into this category.
  preferSize?: boolean
}

// Derive the generation info type directly from the SDK so we don't manually
// duplicate field definitions. Includes totalCost, promptTokens, generationTime, etc.
export type GatewayGenerationInfo = Awaited<ReturnType<typeof gatewayFn.getGenerationInfo>>

export interface RunResult {
  model: ModelConfig
  success: boolean
  error?: string
  wallLatencyMs: number // Client-side wall clock time
  imageCount: number
  savedImages: string[] // Paths to saved images (empty if --no-save)
  cost?: string // Total cost in USD
}
