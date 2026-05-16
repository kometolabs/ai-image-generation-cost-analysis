/**
 * Adds a compact caption pill to each benchmark image in the images/ directory.
 * The pill overlays the bottom-left corner - no canvas extension, no full-width bar.
 * Outputs captioned images to images/captioned/.
 *
 * Usage: bun run src/add-captions.ts [--input ./results/images] [--output ./results/images/captioned]
 *
 * Filename format produced by runners: {provider}-{model-slug}-{13-digit-timestamp}-{index}.{ext}
 * e.g. bfl-flux-pro-1.1-1776689737504-0.jpeg  →  provider "BFL", model "Flux Pro 1.1"
 */

import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";

// Pill geometry and typography.
const FONT_SIZE = 26;
const FONT_SIZE_SMALL = 18;
const LINE_GAP = 6;
const PAD_X = 18;
const PAD_Y = 12;
const RADIUS = 10;
const MARGIN = 16; // distance from image edge

// Approximate character width coefficients for Arial (bold / regular).
const CHAR_WIDTH_BOLD = 0.62;
const CHAR_WIDTH_NORMAL = 0.55;

// Supported image extensions.
const IMAGE_EXTS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".tiff",
]);

// Parse CLI args.
const args = process.argv.slice(2);
const inputDir = args[args.indexOf("--input") + 1] ?? "./results/images";
const outputDir =
  args[args.indexOf("--output") + 1] ?? "./results/images/captioned";

// Display names for known providers (fallback: title-case the raw segment).
const PROVIDER_DISPLAY: Record<string, string> = {
  bfl: "Black Forest Labs",
  google: "Google",
  openai: "OpenAI",
  xai: "xAI",
  recraft: "Recraft",
  prodia: "Prodia",
};

function titleCase(s: string): string {
  return s
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Parses provider and model name from a benchmark filename.
 * Strips the trailing -<13-digit timestamp>-<index> suffix, then splits
 * on the first '-' to get the provider segment and model slug.
 */
function parseFilename(filename: string): {
  provider: string;
  modelName: string;
} {
  const base = path.basename(filename, path.extname(filename));
  const withoutSuffix = base.replace(/-\d{13}-\d+$/, "");

  const firstDash = withoutSuffix.indexOf("-");
  if (firstDash === -1) {
    return { provider: withoutSuffix, modelName: withoutSuffix };
  }

  const providerSlug = withoutSuffix.slice(0, firstDash);
  const modelSlug = withoutSuffix.slice(firstDash + 1);

  const provider = PROVIDER_DISPLAY[providerSlug] ?? titleCase(providerSlug);
  const modelName = titleCase(modelSlug);

  return { provider, modelName };
}

function estimateTextWidth(
  text: string,
  fontSize: number,
  charWidthCoef: number,
): number {
  return Math.ceil(text.length * fontSize * charWidthCoef);
}

function buildPillSvg(
  provider: string,
  modelName: string,
): { svg: Buffer; width: number; height: number } {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const nameWidth = estimateTextWidth(modelName, FONT_SIZE, CHAR_WIDTH_BOLD);
  const providerWidth = estimateTextWidth(
    provider,
    FONT_SIZE_SMALL,
    CHAR_WIDTH_NORMAL,
  );
  const textWidth = Math.max(nameWidth, providerWidth);

  const pillW = textWidth + PAD_X * 2;
  const pillH = PAD_Y + FONT_SIZE + LINE_GAP + FONT_SIZE_SMALL + PAD_Y;

  const nameY = PAD_Y + FONT_SIZE;
  const providerY = nameY + LINE_GAP + FONT_SIZE_SMALL;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${pillW}" height="${pillH}">
  <rect width="${pillW}" height="${pillH}" rx="${RADIUS}" ry="${RADIUS}" fill="#111827" fill-opacity="0.82"/>
  <text
    x="${PAD_X}" y="${nameY}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${FONT_SIZE}"
    font-weight="bold"
    fill="#f9fafb"
  >${esc(modelName)}</text>
  <text
    x="${PAD_X}" y="${providerY}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${FONT_SIZE_SMALL}"
    fill="#9ca3af"
  >${esc(provider)}</text>
</svg>`;

  return { svg: Buffer.from(svg.trim()), width: pillW, height: pillH };
}

async function addCaption(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  const filename = path.basename(inputPath);
  const { provider, modelName } = parseFilename(filename);

  const image = sharp(inputPath);
  const { svg } = buildPillSvg(provider, modelName);

  const pillImg = await sharp(svg).png().toBuffer();

  // Overlay pill in the bottom-left corner with a margin.
  await image
    .composite([{ input: pillImg, left: MARGIN, top: MARGIN }])
    .toFile(outputPath);

  console.log(`  captioned: ${filename}  →  ${modelName} (${provider})`);
}

async function main(): Promise<void> {
  const resolvedInput = path.resolve(inputDir);
  const resolvedOutput = path.resolve(outputDir);

  if (!fs.existsSync(resolvedInput)) {
    console.error(`Input directory not found: ${resolvedInput}`);
    process.exit(1);
  }

  fs.mkdirSync(resolvedOutput, { recursive: true });

  const files = fs.readdirSync(resolvedInput).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return (
      IMAGE_EXTS.has(ext) && fs.statSync(path.join(resolvedInput, f)).isFile()
    );
  });

  if (files.length === 0) {
    console.log("No images found in", resolvedInput);
    return;
  }

  console.log(`Adding captions to ${files.length} images...`);

  for (const file of files) {
    const inputPath = path.join(resolvedInput, file);
    // Always output as PNG for consistency.
    const outputFile = path.basename(file, path.extname(file)) + ".png";
    const outputPath = path.join(resolvedOutput, outputFile);
    await addCaption(inputPath, outputPath);
  }

  console.log(`\nDone. Captioned images saved to: ${resolvedOutput}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
