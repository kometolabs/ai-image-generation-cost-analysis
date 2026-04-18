# AI Image Generation Cost Analysis

Benchmark image generation models behind Vercel AI Gateway, save the generated images, and produce a Markdown report with cost and latency per model.

A companion blog post with benchmark results and conclusions: [komelin.com/blog/ai-image-generation-cost-analysis](https://komelin.com/blog/ai-image-generation-cost-analysis)

## What It Does

- Runs multiple image generation models through a single CLI.
- Supports both `generateImage` and `generateText` image-producing models from the Vercel AI SDK.
- Saves generated images to `./images`.
- Writes a Markdown report to `./report.md`.
- Tracks provider-reported cost when available.

## Models Covered

This repo currently includes all enabled models from [`src/models.ts`](./src/models.ts):

- `google/gemini-2.5-flash-image`
- `google/gemini-3.1-flash-image-preview`
- `google/gemini-3-pro-image`
- `google/imagen-4.0-fast-generate-001`
- `google/imagen-4.0-generate-001`
- `google/imagen-4.0-ultra-generate-001`
- `bfl/flux-2-flex`
- `bfl/flux-2-pro`
- `bfl/flux-pro-1.1`
- `bfl/flux-pro-1.1-ultra`
- `bfl/flux-kontext-pro`
- `bfl/flux-kontext-max`
- `recraft/recraft-v3`
- `recraft/recraft-v4`
- `recraft/recraft-v4-pro`
- `openai/gpt-image-1`
- `xai/grok-imagine-image`
- `xai/grok-imagine-image-pro`

Provider-specific quirks and workarounds are documented in [MODEL-QUIRKS.md](./MODEL-QUIRKS.md).

## Requirements

- [Bun](https://bun.sh)

## Install

```bash
bun install
```

## Configure

### Create and add Vercel AI Gateway API Key

Create an API key at https://vercel.com/d?to=/[team]/~/ai-gateway/api-keys

```bash
cp .env.example .env
```

Set the `AI_GATEWAY_API_KEY` environment variable `.env.example`:

```bash
export AI_GATEWAY_API_KEY=your_key_here
```

### Configure benchmark

Edit [src/config.ts](./src/config.ts) to change:

- the benchmark prompt
- aspect ratio and size
- image count
- request delay
- output paths

Edit [src/models.ts](./src/models.ts) to enable or disable models or adjust model-specific options.

## Run

```bash
bun start
```

For development:

```bash
bun dev
```

## Output

The CLI prints progress for each model and generates:

- `images/` with one or more saved outputs per model
- `report.md` with a comparison table including:
  - model ID
  - cost
  - duration
  - preview image

Durations marked with `*` are wall-clock timings measured by the client.

## Notes

- `generateText` image models return image files via `result.files`.
- `generateImage` models return images via `result.images`.
- Some providers need special handling for `size`, `aspectRatio`, or provider options. See [MODEL-QUIRKS.md](./MODEL-QUIRKS.md) for details.
- Cost metadata depends on what the gateway/provider returns.
