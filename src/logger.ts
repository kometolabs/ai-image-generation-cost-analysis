import path from 'node:path'
import type { RunResult } from './types.js'

export interface ReportOptions {
  thumbnailDir: string
}

function formatPrice(cost?: string): string {
  if (cost == null) return '-'
  // Trim float-precision garbage (e.g. 0.014000000000000002 -> 0.014)
  // while keeping legitimate precision (e.g. 0.0390369).
  const cleaned = parseFloat(Number(cost).toFixed(8))
  return `$${cleaned}`
}

export async function writeReport(
  prompt: string,
  results: RunResult[],
  reportPath: string,
  opts: ReportOptions,
): Promise<string> {
  const reportDir = path.dirname(path.resolve(reportPath))
  const toRel = (p: string) => {
    const rel = path.relative(reportDir, path.resolve(p))
    // Prefix sibling paths with ./ for explicit relativity (Markdown-friendly).
    return rel.startsWith('.') ? rel : `./${rel}`
  }

  const rows = results.map((r) => {
    const model = `\`${r.model.id}\``
    const price = formatPrice(r.cost);
    const latency = r.success
      ? `${(r.wallLatencyMs / 1000).toFixed(1)}s`
      : "FAILED";

    let image = "-";
    if (r.savedImages[0]) {
      const basename = path.basename(r.savedImages[0]);
      const full = toRel(r.savedImages[0])
      const thumb = toRel(path.join(opts.thumbnailDir, basename))
      image = `[![${r.model.name}](${thumb})](${full})`;
      if (r.model.size) image += ` (${r.model.size})`;
    }

    return `| ${model} | ${price} | ${latency} | ${image} |`
  })

  const totalCost = results.reduce((sum, r) => sum + (r.cost != null ? parseFloat(r.cost) : 0), 0)
  const totalLatencyMs = results.reduce((sum, r) => sum + (r.success ? r.wallLatencyMs : 0), 0)
  const totalCostStr = `$${parseFloat(totalCost.toFixed(8))}`
  const totalLatencyStr = `${(totalLatencyMs / 1000).toFixed(1)}s`

  const md = [
    `# AI Image Model Benchmark`,
    ``,
    `**Run:** ${new Date().toISOString()}`,
    `**Prompt:** ${prompt}`,
    ``,
    `| Model | Price | Latency | Image |`,
    `| ----- | ----- | ------- | ----- |`,
    ...rows,
    ``,
    `**Total spent:** ${totalCostStr}`,
    `**Total time:** ${totalLatencyStr}`,
    ``,
    `_The latency here is wall time, measured by the benchmark script._`,
    `_The cost, however, is returned by the gateway, so it should be accurate._`,
  ].join("\n");

  await Bun.write(reportPath, md)
  return path.resolve(reportPath)
}
