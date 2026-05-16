import path from 'node:path'
import { config } from './config.js'
import { writeReport } from './logger.js'
import { allModels } from './models.js'
import { generateCharts } from './phases/generateCharts.js'
import { generateThumbnails } from './phases/generateThumbnails.js'
import { runGenerateImage } from './runners/generateImage.js'
import { runGenerateText } from './runners/generateText.js'
import type { RunResult } from './types.js'

if (!process.env['AI_GATEWAY_API_KEY']) {
  console.error('Error: AI_GATEWAY_API_KEY is not set.')
  process.exit(1)
}

const outputDir = path.resolve(config.outputDir)
const thumbnailDir = path.resolve(config.thumbnailDir)
const chartsDir = path.resolve(config.chartsDir)
const reportPath = path.resolve(config.reportPath)

console.log(`\nPrompt: "${config.prompt.slice(0, 80)}..."`)
console.log(`Models: ${allModels.length}\n`)

const results: RunResult[] = []

for (const model of allModels) {
  process.stdout.write(`  [${model.type}] ${model.name} (${model.id}) ... `)

  const result =
    model.type === 'generateText'
      ? await runGenerateText(model, config.prompt, {
          outputDir,
          saveImages: true,
        })
      : await runGenerateImage(model, config.prompt, {
          outputDir,
          saveImages: true,
          n: config.n,
          aspectRatio: config.aspectRatio,
          size: config.size,
        })

  if (result.success) {
    const cost = result.cost != null ? ` $${result.cost}` : ''
    console.log(`OK ${(result.wallLatencyMs / 1000).toFixed(2)}s*, ${result.imageCount} image(s)${cost}`)
  } else {
    console.log(`FAILED: ${result.error?.slice(0, 70)}`)
  }

  results.push(result)

  // Short delay between requests to avoid rate limiting.
  if (model !== allModels[allModels.length - 1]) {
    await new Promise((resolve) => setTimeout(resolve, config.delayBetweenRequestsMs))
  }
}

console.log('\nGenerating thumbnails...')
const thumbnails = await generateThumbnails(results, { thumbnailDir })
console.log(`  ${thumbnails.length} new thumbnail(s) -> ${thumbnailDir}`)

console.log('\nGenerating charts...')
const charts = await generateCharts(results, { chartsDir })
console.log(`  ${charts.length} chart(s) -> ${chartsDir}`)

const absReportPath = await writeReport(config.prompt, results, reportPath)
console.log(`\nReport: ${absReportPath}`)
