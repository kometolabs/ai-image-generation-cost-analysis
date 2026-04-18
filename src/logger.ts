import path from 'node:path'
import type { RunResult } from './types.js'

export async function writeReport(prompt: string, results: RunResult[], reportPath: string): Promise<string> {
  const rows = results.map((r) => {
    const model = `\`${r.model.id}\``
    const price = r.cost != null ? `$${r.cost}` : '-'
    const latency = r.success ? `${(r.wallLatencyMs / 1000).toFixed(1)}s*` : 'FAILED'
    const image = r.savedImages[0]
      ? `![${r.model.name}](${path.relative(path.dirname(reportPath), r.savedImages[0])})`
      : '-'

    return `| ${model} | ${price} | ${latency} | ${image} |`
  })

  const md = [
    `# Image Generation Cost Report`,
    ``,
    `**Run:** ${new Date().toISOString()}`,
    `**Prompt:** ${prompt}`,
    ``,
    `| Model | Price | Latency | Image |`,
    `|-------|-------|----------|-------|`,
    ...rows,
    ``,
    `\\* wall time (gateway generation time unavailable for this model)`,
  ].join('\n')

  await Bun.write(reportPath, md)
  return path.resolve(reportPath)
}
