# Model Quirks and Adaptations

Documented workarounds for non-standard behavior across image generation providers.

---

## Black Forest Labs - All Flux models

**Quirk:** BFL's API natively accepts `width` and `height` in pixels. It does not support
the `aspectRatio` string parameter that the Vercel AI SDK passes by default.

**Symptom:** Requesting `aspectRatio: '1:1'` maps to a small internal preset (not 1024x1024).
The BFL default output is 1024x768 (landscape), not square.

**Adaptation:** Pass explicit pixel dimensions via `providerOptions.blackForestLabs`:
```ts
providerOptions: { blackForestLabs: { width: 1024, height: 1024 } }
```

**Constraints:** Width and height must be multiples of 32, between 256 and 1440px.

**Affected models:** `bfl/flux-pro-1.1` (and likely all other `bfl/*` models)

**Code:** `src/models.ts` - `providerOptions` field on BFL model entries

---

## Recraft - V4 Pro

**Quirk:** `recraft-v4-pro` is a 2x-resolution model. It does not accept `1024x1024`
as a valid size - its minimum square output is `2048x2048`.

**Symptom:** Passing `size: '1024x1024'` returns HTTP 400 Bad Request.

**Adaptation:** Override the global size with a model-level `size` field:
```ts
size: '2048x2048'
```

**Affected models:** `recraft/recraft-v4-pro`

**Code:** `src/models.ts` - `size` field; `src/runners/generateImage.ts` - `model.size ?? opts.size`

---

## Recraft, OpenAI - size param instead of aspectRatio

**Quirk:** Recraft and OpenAI models require the `size` parameter (e.g. `'1024x1024'`)
rather than `aspectRatio` (e.g. `'1:1'`). Passing `aspectRatio` is silently ignored or errors.

**Adaptation:** Set `preferSize: true` on the model config. The runner then passes
`size` instead of `aspectRatio`.

**Affected models:** `recraft/recraft-v3`, `recraft/recraft-v4`, `recraft/recraft-v4-pro`,
`openai/gpt-image-1`

**Code:** `src/models.ts` - `preferSize` field; `src/runners/generateImage.ts` - `dimensionParam`

---

## xAI - aspectRatio only, no size param

**Quirk:** xAI Grok models only support `aspectRatio`. Passing `size` is not supported
and will error.

**Adaptation:** These models do NOT set `preferSize: true`, so they always use the
`aspectRatio` path in the runner.

**Affected models:** `xai/grok-imagine-image`, `xai/grok-imagine-image-pro`

**Code:** `src/models.ts` - comment on xAI section

---

## Google Gemini - duplicate images in result.files

**Quirk:** When calling `generateText` with a Gemini image model, the Vercel AI SDK
can add the same image twice to `result.files` during response transformation. This is
a known SDK-level issue with how Gemini response parts are mapped.

**Symptom:** The run reports 2 images saved, but both files are byte-identical.

**Adaptation:** Deduplicate `result.files` by comparing the first 64 base64 chars
of each image's binary content before saving:
```ts
const seen = new Set<string>()
const imageFiles = (result.files ?? [])
  .filter((f) => f.mediaType?.startsWith('image/'))
  .filter((f) => {
    const key = Buffer.from(f.uint8Array).toString('base64').slice(0, 64)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
```

**Affected models:** All `generateText`-type models (Google Gemini family)

**Code:** `src/runners/generateText.ts` - deduplication block
