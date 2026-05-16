import path from 'node:path'
import type { RunResult } from './types.js'

// Public URL bases for the report. Images live in /results/images and
// thumbnails share the same filename inside /results/images/thumbnails.
const IMAGE_URL_BASE = '/results/images'
const THUMBNAIL_URL_BASE = '/results/images/thumbnails'

function formatPrice(cost?: string): string {
  if (cost == null) return '-'
  // Trim float-precision garbage (e.g. 0.014000000000000002 -> 0.014)
  // while keeping legitimate precision (e.g. 0.0390369).
  const cleaned = parseFloat(Number(cost).toFixed(8))
  return `$${cleaned}`
}

export async function writeReport(prompt: string, results: RunResult[], reportPath: string): Promise<string> {
  const rows = results.map((r) => {
    const model = `\`${r.model.id}\``
    const price = formatPrice(r.cost);
    const latency = r.success
      ? `${(r.wallLatencyMs / 1000).toFixed(1)}s`
      : "FAILED";

    let image = "-";
    if (r.savedImages[0]) {
      const basename = path.basename(r.savedImages[0]);
      const full = `${IMAGE_URL_BASE}/${basename}`;
      const thumb = `${THUMBNAIL_URL_BASE}/${basename}`;
      image = `[![${r.model.name}](${thumb})](${full})`;
      if (r.model.size) image += ` (${r.model.size})`;
    }

    return `| ${model} | ${price} | ${latency} | ${image} |`
  })

  const md = [
    `# Image Generation Cost Report`,
    ``,
    `**Run:** ${new Date().toISOString()}`,
    `**Prompt:** ${prompt}`,
    ``,
    `| Model | Price | Latency | Image |`,
    `| ----- | ----- | ------- | ----- |`,
    ...rows,
    ``,
    `_The latency here is wall time, measured by the benchmark script._`,
    `_The cost, however, is returned by the gateway, so it should be accurate._`,
  ].join("\n");

  await Bun.write(reportPath, md)
  return path.resolve(reportPath)
}
