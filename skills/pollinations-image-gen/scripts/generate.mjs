#!/usr/bin/env node

/**
 * Pollinations Image Generation Script
 *
 * Usage:
 *   node generate.mjs --prompt "a cute cat" --model flux [--output /path/to/output.png] [--width 1024] ...
 *
 * Files are saved to --output path if specified, otherwise to the current working directory.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// ─── Parse CLI arguments ────────────────────────────────────────────────────

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith("--")) {
            const key = arg.slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith("--")) {
                args[key] = next;
                i++;
            } else {
                args[key] = "true";
            }
        }
    }
    return args;
}

const args = parseArgs(process.argv);

// ─── Validate required params ───────────────────────────────────────────────

const API_KEY = process.env.POLLINATIONS_API_KEY;
if (!API_KEY) {
    console.error("Error: POLLINATIONS_API_KEY environment variable is not set.");
    process.exit(1);
}

const prompt = args.prompt;
if (!prompt) {
    console.error("Error: --prompt is required.");
    console.error(
        'Usage: node generate.mjs --prompt "a cute cat" --model flux [options]'
    );
    process.exit(1);
}

// ─── Build request ──────────────────────────────────────────────────────────

const BASE_URL = "https://gen.pollinations.ai";

const FREE_MODELS = ["flux", "zimage", "imagen-4", "klein", "klein-large", "gptimage"];
const PAID_MODELS = ["seedream", "seedream-pro", "kontext", "nanobanana", "nanobanana-pro", "gptimage-large"];

const isPaid = process.env.POLLINATIONS_PAID === "true";
const ALL_MODELS = isPaid ? [...FREE_MODELS, ...PAID_MODELS] : FREE_MODELS;

const model = args.model || "zimage";

if (!ALL_MODELS.includes(model)) {
    if (PAID_MODELS.includes(model)) {
        console.error(`Error: Model "${model}" requires POLLINATIONS_PAID=true.`);
        console.error(`Available free models: ${FREE_MODELS.join(", ")}`);
    } else {
        console.error(`Error: Unknown model "${model}".`);
        console.error(`Available models: ${ALL_MODELS.join(", ")}`);
    }
    process.exit(1);
}

// Build query parameters from all provided args (except prompt)
const params = new URLSearchParams();
params.set("model", model);

const SUPPORTED_PARAMS = [
    "width",
    "height",
    "seed",
    "enhance",
    "negative_prompt",
    "safe",
    "quality",
    "image",
    "transparent",
];

for (const key of SUPPORTED_PARAMS) {
    if (args[key] !== undefined) {
        params.set(key, args[key]);
    }
}

const encodedPrompt = encodeURIComponent(prompt);
const url = `${BASE_URL}/image/${encodedPrompt}?${params.toString()}`;

// ─── Generate ───────────────────────────────────────────────────────────────

async function generate() {
    console.log(`Model: ${model}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`URL: ${url.length > 200 ? url.substring(0, 200) + "..." : url}`);
    console.log("Generating...");

    const startTime = Date.now();

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
    });

    if (!response.ok) {
        let errorBody = "";
        try {
            errorBody = await response.text();
        } catch { }
        console.error(`Error: HTTP ${response.status} ${response.statusText}`);
        console.error(errorBody);
        process.exit(1);
    }

    const contentType = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());
    const elapsed = Date.now() - startTime;

    // Determine file extension
    let ext = ".jpg";
    if (contentType.includes("image/png")) ext = ".png";
    else if (contentType.includes("image/webp")) ext = ".webp";
    else if (contentType.includes("image/gif")) ext = ".gif";
    else if (contentType.includes("image/jpeg")) ext = ".jpg";

    // Determine output path
    let outputPath;
    if (args.output) {
        outputPath = resolve(process.cwd(), args.output);
    } else {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const sanitizedModel = model.replace(/[^a-zA-Z0-9-]/g, "_");
        const filename = `pollinations-${sanitizedModel}-${timestamp}${ext}`;
        outputPath = resolve(process.cwd(), filename);
    }

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(1);

    console.log(`\nDone!`);
    console.log(`  File: ${outputPath}`);
    console.log(`  Size: ${sizeKB} KB`);
    console.log(`  Content-Type: ${contentType}`);
    console.log(`  Time: ${(elapsed / 1000).toFixed(1)}s`);
}

generate().catch((err) => {
    console.error("Generation failed:", err.message);
    process.exit(1);
});
