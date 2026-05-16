import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import type { RunResult } from '../types.js'

export interface ThumbnailOptions {
  thumbnailDir: string
  size?: number
}

// Generates square cover thumbnails for every successfully saved image.
// Thumbnails keep the original filename so the report can reference them
// via /images/thumbnails/<same-name> alongside /images/<same-name>.
export async function generateThumbnails(results: RunResult[], opts: ThumbnailOptions): Promise<string[]> {
  const size = opts.size ?? 400
  fs.mkdirSync(opts.thumbnailDir, { recursive: true })

  const written: string[] = []
  for (const r of results) {
    for (const imagePath of r.savedImages) {
      const out = path.join(opts.thumbnailDir, path.basename(imagePath))
      if (fs.existsSync(out)) continue
      await sharp(imagePath).resize(size, size, { fit: 'cover' }).toFile(out)
      written.push(out)
    }
  }
  return written
}
