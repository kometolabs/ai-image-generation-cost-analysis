import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import fs from 'node:fs'
import path from 'node:path'
import type { RunResult } from '../types.js'

export interface ChartOptions {
  chartsDir: string
  width?: number
  height?: number
}

interface ChartSpec {
  labels: string[]
  values: number[]
  label: string
  unit: string
  color: string
  filename: string
}

const FONT = 'Inter, sans-serif'
const BG = '#ffffff'

export async function generateCharts(results: RunResult[], opts: ChartOptions): Promise<string[]> {
  const width = opts.width ?? 1200
  const height = opts.height ?? 600

  fs.mkdirSync(opts.chartsDir, { recursive: true })

  const date = new Date().toISOString().slice(0, 10)

  const data = results
    .filter((r) => r.success && r.cost != null)
    .map((r) => ({
      model: r.model.id,
      price: parseFloat(r.cost as string),
      duration: r.wallLatencyMs / 1000,
    }))

  if (data.length === 0) return []

  const byPrice = [...data].sort((a, b) => a.price - b.price)
  const byDuration = [...data].sort((a, b) => a.duration - b.duration)

  const renderer = new ChartJSNodeCanvas({ width, height, backgroundColour: BG })

  const specs: ChartSpec[] = [
    {
      labels: byPrice.map((d) => d.model),
      values: byPrice.map((d) => d.price),
      label: 'Cost per image ($)',
      unit: '$',
      color: '#3b82f6',
      filename: 'cost.png',
    },
    {
      labels: byDuration.map((d) => d.model),
      values: byDuration.map((d) => d.duration),
      label: 'Latency (seconds)',
      unit: '',
      color: '#10b981',
      filename: 'latency.png',
    },
  ]

  const written: string[] = []
  for (const spec of specs) {
    const buffer = await renderer.renderToBuffer({
      type: 'bar',
      data: {
        labels: spec.labels,
        datasets: [
          {
            label: spec.label,
            data: spec.values,
            backgroundColor: spec.color,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: false,
        layout: { padding: { top: 16, right: 32, bottom: 16, left: 16 } },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `${spec.label} - ${date}`,
            font: { size: 16, family: FONT, weight: 'bold' },
            padding: { bottom: 16 },
          },
          tooltip: { enabled: false },
          subtitle: {
            display: true,
            text: 'by @kometolabs and @kkomelin',
            position: 'bottom',
            align: 'center',
            color: '#9ca3af',
            font: { size: 13, family: FONT },
            padding: { top: 12 },
          },
        },
        scales: {
          x: {
            ticks: {
              callback: (v: number | string) => `${spec.unit}${v}`,
              font: { size: 11, family: FONT },
            },
            grid: { color: '#f0f0f0' },
          },
          y: {
            ticks: { font: { size: 11, family: FONT } },
            grid: { display: false },
          },
        },
      },
    })

    const out = path.join(opts.chartsDir, spec.filename)
    fs.writeFileSync(out, buffer)
    written.push(out)
  }
  return written
}
