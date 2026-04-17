import type { JSONValue } from 'ai'

export type ModelType = 'generateText' | 'generateImage'

export interface ModelConfig {
  id: string // Vercel AI Gateway model ID (e.g. 'google/gemini-2.5-flash-image')
  name: string // Human-readable name
  type: ModelType // Which SDK function to use
  provider: string // Provider display name
  notes?: string
  // Set to false to skip this model during runs.
  enabled: boolean
  // Set to true for models that use `size` (e.g. '1024x1024') instead of `aspectRatio`.
  // Recraft and OpenAI models fall into this category.
  preferSize?: boolean
  // Override the global config size for this model (e.g. recraft-v4-pro requires '2048x2048').
  // Only applies when preferSize is true.
  size?: `${number}x${number}`
  // Provider-specific options passed directly to generateImage's providerOptions.
  // Use for models that need explicit params not covered by aspectRatio/size
  // (e.g. BFL models require width/height in pixels since they don't support aspectRatio natively).
  providerOptions?: Record<string, Record<string, JSONValue>>
}

export interface RunResult {
  model: ModelConfig
  success: boolean
  error?: string
  wallLatencyMs: number // Client-side wall clock time
  imageCount: number
  savedImages: string[] // Paths to saved images (empty if --no-save)
  cost?: string // Total cost in USD
}
