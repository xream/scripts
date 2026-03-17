---
name: pollinations-image-gen
description: Generate images using the Pollinations.ai API. Supports models such as flux, zimage, imagen-4, klein, klein-large, gptimage (free), and seedream, kontext, nanobanana, gptimage-large (paid). Use when the user asks to generate, create, or draw images from text prompts.
metadata: { "openclaw": { "requires": { "env": ["POLLINATIONS_API_KEY", "POLLINATIONS_PAID"] }, "primaryEnv": "POLLINATIONS_API_KEY", "emoji": "🎨" } }
---

# Pollinations Image Generation

Generate images from text descriptions using the Pollinations.ai API.

## When to use

- User asks to generate, create, draw, or render an image
- User mentions Pollinations, or any of the supported model names

## How to use

Run the generation script at `{baseDir}/scripts/generate.mjs` with `node`. Pass all parameters as `--key value` CLI flags.

### Required parameters

| Parameter | Description |
|-----------|-------------|
| `--prompt` | Text description of the image to generate. You should craft a detailed, high-quality prompt based on the user's request. |
| `--model` | AI model to use (see model list below) |

### Optional parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--output` | Output file path. Parent directories will be created automatically. If omitted, saves to current directory with a timestamped filename | auto |
| `--width` | Image width in pixels | 1024 |
| `--height` | Image height in pixels | 1024 |
| `--seed` | Random seed for reproducible results. Use -1 for random | 0 |
| `--enhance` | Set to `true` to let AI improve the prompt for better results | false |
| `--negative_prompt` | Things to avoid in the image | "worst quality, blurry" |
| `--safe` | Set to `true` to enable safety content filters | false |
| `--quality` | Image quality: `low`, `medium`, `high`, `hd` (gptimage only) | medium |
| `--image` | Reference image URL(s), comma/pipe separated for multiple | - |
| `--transparent` | Set to `true` for transparent background (gptimage only) | false |

### Available models

**Free models** (always available):
- `flux` — Fast, high-quality image generation (default)
- `zimage` — High-quality image generation
- `imagen-4` — Google Imagen 4
- `klein` — Klein image generation
- `klein-large` — Klein large image generation
- `gptimage` — GPT Image (supports quality and transparent options)

**Paid models** (requires `POLLINATIONS_PAID=true`):
- `seedream` / `seedream-pro` — Seedream image generation
- `kontext` — Kontext model
- `nanobanana` / `nanobanana-pro` — NanoBanana image generation
- `gptimage-large` — GPT Image large variant

## Examples

### Basic: just prompt and model

```bash
node {baseDir}/scripts/generate.mjs --prompt "a beautiful sunset over mountains" --model flux
```

### Custom size (--width, --height)

```bash
node {baseDir}/scripts/generate.mjs --prompt "a panoramic futuristic cityscape at night" --model imagen-4 --width 1536 --height 768
```

### Reproducible result (--seed)

```bash
node {baseDir}/scripts/generate.mjs --prompt "a red panda sitting on a branch" --model klein --seed 42
```

### AI-enhanced prompt (--enhance)

```bash
node {baseDir}/scripts/generate.mjs --prompt "cat" --model zimage --enhance true
```

### Negative prompt (--negative_prompt)

```bash
node {baseDir}/scripts/generate.mjs --prompt "a professional product photo of sneakers" --model flux --negative_prompt "blurry, low quality, watermark, text"
```

### Safety filter (--safe)

```bash
node {baseDir}/scripts/generate.mjs --prompt "a fantasy battle scene" --model klein-large --safe true
```

### Quality control (--quality, gptimage only)

```bash
node {baseDir}/scripts/generate.mjs --prompt "an oil painting of a library interior" --model gptimage --quality hd
```

### Transparent background (--transparent, gptimage only)

```bash
node {baseDir}/scripts/generate.mjs --prompt "a cartoon robot mascot" --model gptimage --transparent true
```

### Reference image (--image)

```bash
node {baseDir}/scripts/generate.mjs --prompt "make it look like a watercolor painting" --model kontext --image "https://example.com/photo.jpg"
```

### Save to a specific path (--output)

```bash
node {baseDir}/scripts/generate.mjs --prompt "a watercolor landscape" --model flux --output /tmp/landscape.jpg
```

### Combining multiple options

```bash
node {baseDir}/scripts/generate.mjs --prompt "a detailed fantasy map" --model gptimage --width 2048 --height 2048 --quality hd --seed 123 --negative_prompt "blurry, text" --safe true --output ./map.png
```

## Important notes

- If `--output` is specified, the file is saved to that path; otherwise a timestamped filename is used in the current directory.
- Model availability depends on the `POLLINATIONS_PAID` env var. If `POLLINATIONS_PAID` is not `true`, only free models can be used.
- Choose the model based on the user's requirements. Default to `flux` for images if no preference.
- When crafting prompts, be detailed and descriptive for best results.
- Always tell the user the output file path after generation completes.
