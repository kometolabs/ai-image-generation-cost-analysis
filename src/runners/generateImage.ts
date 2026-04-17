import { generateImage } from 'ai'
import fs from 'node:fs'
import path from 'node:path'
import { config } from "../config.js";
import type { ModelConfig, RunResult } from '../types.js'

export interface GenerateImageOptions {
  outputDir: string
  saveImages: boolean
  n?: number
  aspectRatio?: string
  size?: string
}

// Runs an image-only model via Vercel AI Gateway.
// The provider prefix in model.id (e.g. 'bfl/...', 'xai/...') routes automatically
// through the gateway. Images are returned in result.images as base64 strings.
// Note: xAI models (xai/grok-*) do not support the size param - aspectRatio only.
// Models with preferSize=true use the `size` param instead of `aspectRatio`.
export async function runGenerateImage(
  model: ModelConfig,
  prompt: string,
  opts: GenerateImageOptions,
): Promise<RunResult> {
  const start = Date.now()
  const savedImages: string[] = []

  try {
    const dimensionParam = model.preferSize
      ? {
          size: (model.size ?? opts.size ?? config.size) as Parameters<
            typeof generateImage
          >[0]["size"],
        }
      : {
          aspectRatio: (opts.aspectRatio ?? "1:1") as Parameters<
            typeof generateImage
          >[0]["aspectRatio"],
        };

    const result = await generateImage({
      model: model.id,
      prompt,
      n: opts.n ?? 1,
      ...dimensionParam,
      ...(model.providerOptions
        ? { providerOptions: model.providerOptions }
        : {}),
    });

    const wallLatencyMs = Date.now() - start

    if (opts.saveImages && result.images.length > 0) {
      fs.mkdirSync(opts.outputDir, { recursive: true })
      const timestamp = Date.now()

      for (const [i, image] of result.images.entries()) {
        const ext = image.mediaType?.split('/')[1] ?? 'png'
        const slug = model.id.replace('/', '-')
        const filepath = path.join(opts.outputDir, `${slug}-${timestamp}-${i}.${ext}`)
        await fs.promises.writeFile(filepath, Buffer.from(image.base64, 'base64'))
        savedImages.push(filepath)
      }
    }

    const gateway = result.providerMetadata?.gateway ?? { cost: null }

    return {
      model,
      success: true,
      wallLatencyMs,
      imageCount: result.images.length,
      savedImages,
      cost: (gateway as any)?.cost,
    }
  } catch (error) {
    return {
      model,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      wallLatencyMs: Date.now() - start,
      imageCount: 0,
      savedImages: [],
    }
  }
}
