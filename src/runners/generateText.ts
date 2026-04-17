import { generateText } from 'ai'
import fs from 'node:fs'
import path from 'node:path'
import type { ModelConfig, RunResult } from '../types.js'

export interface GenerateTextOptions {
  outputDir: string
  saveImages: boolean
}

// Runs a generateText model (Nano Banana family) via Vercel AI Gateway.
// The provider prefix in model.id (e.g. 'google/...') routes automatically
// through the gateway. Images are returned in result.files as uint8Array.
export async function runGenerateText(
  model: ModelConfig,
  prompt: string,
  opts: GenerateTextOptions,
): Promise<RunResult> {
  const start = Date.now()
  const savedImages: string[] = []

  try {
    const result = await generateText({
      model: model.id,
      prompt,
    })

    const wallLatencyMs = Date.now() - start

    // Images are in result.files - filter to image media types.
    // Deduplicate by content: the Vercel AI SDK can add the same image twice
    // when transforming Gemini's response parts (known SDK-level issue).
    const seen = new Set<string>()
    const imageFiles = (result.files ?? [])
      .filter((f) => f.mediaType?.startsWith('image/'))
      .filter((f) => {
        const key = Buffer.from(f.uint8Array).toString('base64').slice(0, 64)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

    if (opts.saveImages && imageFiles.length > 0) {
      fs.mkdirSync(opts.outputDir, { recursive: true })
      const timestamp = Date.now()

      for (const [i, file] of imageFiles.entries()) {
        const ext = file.mediaType?.split('/')[1] ?? 'png'
        const slug = model.id.replace('/', '-')
        const filepath = path.join(opts.outputDir, `${slug}-${timestamp}-${i}.${ext}`)
        await fs.promises.writeFile(filepath, file.uint8Array)
        savedImages.push(filepath)
      }
    }

    const gateway = result.providerMetadata?.gateway ?? { cost: null }

    return {
      model,
      success: true,
      wallLatencyMs,
      imageCount: imageFiles.length,
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
