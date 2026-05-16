import type { ModelConfig } from './types.js'

// --- generateText models ---
// Multimodal LLMs that return images in result.files (uint8Array).
export const generateTextModels: ModelConfig[] = [
  {
    id: 'google/gemini-2.5-flash-image',
    name: 'Nano Banana (Classic)',
    type: 'generateText',
    provider: 'Google',
    notes: 'Gemini 2.5 Flash - fast multimodal generation',
    enabled: true,
  },
  {
    id: 'google/gemini-3.1-flash-image-preview',
    name: 'Nano Banana 2',
    type: 'generateText',
    provider: 'Google',
    notes: 'Gemini 3.1 Flash - web search grounding, configurable thinking',
    enabled: true,
  },
  {
    id: 'google/gemini-3-pro-image',
    name: 'Nano Banana Pro',
    type: 'generateText',
    provider: 'Google',
    notes: 'Gemini 3 Pro - highest quality multimodal generation',
    enabled: true,
  },
]

// --- generateImage models ---
// Image-only models that return images in result.images (base64).
export const generateImageModels: ModelConfig[] = [
  // Google Imagen
  {
    id: 'google/imagen-4.0-fast-generate-001',
    name: 'Imagen 4 Fast',
    type: 'generateImage',
    provider: 'Google',
    notes: 'Fast, cost-efficient Imagen 4',
    enabled: true,
  },
  {
    id: 'google/imagen-4.0-generate-001',
    name: 'Imagen 4',
    type: 'generateImage',
    provider: 'Google',
    enabled: true,
  },
  {
    id: 'google/imagen-4.0-ultra-generate-001',
    name: 'Imagen 4 Ultra',
    type: 'generateImage',
    provider: 'Google',
    notes: 'Highest fidelity Imagen model',
    enabled: true,
  },
  // Black Forest Labs Flux
  {
    id: 'bfl/flux-2-flex',
    name: 'Flux 2 Flex',
    type: 'generateImage',
    provider: 'Black Forest Labs',
    notes: 'Fast, versatile',
    enabled: true,
  },
  {
    id: 'bfl/flux-2-klein-4b',
    name: 'Flux 2 Klein 4B',
    type: 'generateImage',
    provider: 'Black Forest Labs',
    notes: 'Compact 4B model',
    enabled: true,
  },
  {
    id: 'bfl/flux-2-klein-9b',
    name: 'Flux 2 Klein 9B',
    type: 'generateImage',
    provider: 'Black Forest Labs',
    notes: 'Compact 9B model',
    enabled: true,
  },
  {
    id: 'bfl/flux-2-pro',
    name: 'Flux 2 Pro',
    type: 'generateImage',
    provider: 'Black Forest Labs',
    enabled: true,
  },
  {
    id: 'bfl/flux-pro-1.1',
    name: 'Flux Pro 1.1',
    type: 'generateImage',
    provider: 'Black Forest Labs',
    // BFL natively uses width/height (multiples of 32, 256-1440px).
    // aspectRatio: '1:1' maps to a small preset - use explicit pixels for 1024x1024.
    providerOptions: { blackForestLabs: { width: 1024, height: 1024 } },
    enabled: true,
  },
  {
    id: 'bfl/flux-pro-1.1-ultra',
    name: 'Flux Pro 1.1 Ultra',
    type: 'generateImage',
    provider: 'Black Forest Labs',
    notes: 'Ultra quality, up to 4MP',
    enabled: true,
  },
  {
    id: 'bfl/flux-kontext-pro',
    name: 'Flux Kontext Pro',
    type: 'generateImage',
    provider: 'Black Forest Labs',
    notes: 'Context-aware generation',
    enabled: true,
  },
  {
    id: 'bfl/flux-kontext-max',
    name: 'Flux Kontext Max',
    type: 'generateImage',
    provider: 'Black Forest Labs',
    notes: 'Context-aware, highest quality',
    enabled: true,
  },
  // Recraft (use `size` param, not `aspectRatio`)
  {
    id: 'recraft/recraft-v3',
    name: 'Recraft V3',
    type: 'generateImage',
    provider: 'Recraft',
    notes: 'Photorealism, accurate text rendering, SVG support',
    preferSize: true,
    enabled: true,
  },
  {
    id: 'recraft/recraft-v4',
    name: 'Recraft V4',
    type: 'generateImage',
    provider: 'Recraft',
    notes: 'Top Hugging Face leaderboard, vector output, text accuracy',
    preferSize: true,
    enabled: true,
  },
  {
    id: 'recraft/recraft-v4-pro',
    name: 'Recraft V4 Pro',
    type: 'generateImage',
    provider: 'Recraft',
    preferSize: true,
    // V4 Pro outputs at 2x resolution - 1024x1024 is invalid, use 2048x2048 for 1:1.
    size: '2048x2048',
    enabled: true,
  },
  {
    id: 'recraft/recraft-v4.1',
    name: 'Recraft V4.1',
    type: 'generateImage',
    provider: 'Recraft',
    notes: 'Expressive standard tier of V4.1 - improved photorealism and illustration',
    preferSize: true,
    enabled: true,
  },
  {
    id: 'recraft/recraft-v4.1-pro',
    name: 'Recraft V4.1 Pro',
    type: 'generateImage',
    provider: 'Recraft',
    notes: 'Premium tier - print-ready assets, large-format display',
    preferSize: true,
    // Mirror the V4 Pro quirk: pro tiers generally require 2x resolution.
    size: '2048x2048',
    enabled: true,
  },
  {
    id: 'recraft/recraft-v4.1-utility',
    name: 'Recraft V4.1 Utility',
    type: 'generateImage',
    provider: 'Recraft',
    notes: 'Utility tier - flat lighting, front-facing, ecommerce/mockups',
    preferSize: true,
    enabled: true,
  },
  {
    id: 'recraft/recraft-v4.1-utility-pro',
    name: 'Recraft V4.1 Utility Pro',
    type: 'generateImage',
    provider: 'Recraft',
    notes: 'Premium utility - production-grade catalogs and design systems',
    preferSize: true,
    // Match V4 Pro quirk pre-emptively; adjust if the model accepts 1024x1024.
    size: '2048x2048',
    enabled: true,
  },
  // OpenAI (use `size` param, not `aspectRatio`)
  {
    id: 'openai/gpt-image-1',
    name: 'GPT Image 1',
    type: 'generateImage',
    provider: 'OpenAI',
    notes: 'Complex scene composition, precise prompt following',
    preferSize: true,
    enabled: true,
  },
  {
    id: 'openai/gpt-image-2',
    name: 'GPT Image 2',
    type: 'generateImage',
    provider: 'OpenAI',
    preferSize: true,
    enabled: true,
  },
  // xAI Grok Imagine (aspectRatio only - size param not supported)
  {
    id: 'xai/grok-imagine-image',
    name: 'Grok Imagine',
    type: 'generateImage',
    provider: 'xAI',
    enabled: true,
  },
  // Prodia - FLUX.1 Schnell via Vercel AI Gateway
  {
    id: 'prodia/flux-fast-schnell',
    name: 'Flux Schnell',
    type: 'generateImage',
    provider: 'Prodia',
    notes: 'Ultra-fast, distilled model',
    enabled: true,
  },
]

export const allModels: ModelConfig[] = [...generateTextModels, ...generateImageModels].filter((m) => m.enabled)
