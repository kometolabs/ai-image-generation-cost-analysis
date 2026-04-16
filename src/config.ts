// Text models need these in the prompt, so we'll use constants.
const ASPECT_RATIO = '1:1'
const SIZE = '1024x1024'

// Central config for the cost analysis benchmark.
// Edit this file to change the prompt, aspect ratio, and other defaults.
export const config = {
  // Standard prompt used to test all models.
  // Keep it consistent across runs so cost comparisons are meaningful.
  prompt: `A photorealistic image of a golden retriever puppy sitting in a sunflower field at golden hour, with a soft bokeh background and warm light. Aspect ratio: ${ASPECT_RATIO}, size: ${SIZE}.`,

  // Number of images to generate per model (where supported).
  n: 1,

  // Aspect ratio for generateImage models that support it (e.g. xAI).
  // xAI models only support aspectRatio, not size.
  aspectRatio: ASPECT_RATIO,

  // Size for generateImage models that use the `size` param (e.g. Recraft, OpenAI).
  size: SIZE,

  // Delay in ms between model requests to avoid rate limiting.
  delayBetweenRequestsMs: 1000,

  // Directory for saved images.
  outputDir: './images',

  // Path for the generated Markdown report.
  reportPath: './report.md',

  // Gateway base URL (override via AI_GATEWAY_BASE_URL env var if needed).
  gatewayBaseUrl: process.env['AI_GATEWAY_BASE_URL'] ?? 'https://ai-gateway.vercel.sh/v1',
}
