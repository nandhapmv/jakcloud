import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicOutputDir = path.resolve(rootDir, "frontend/.output/public");
const assetsOutputDir = path.resolve(publicOutputDir, "assets");
const rootAssetsDir = path.resolve(rootDir, "assets");

console.log("📦 Preparing production assets and full SSR index.html...");

// 1. Copy assets to root ./assets
if (fs.existsSync(assetsOutputDir)) {
  if (!fs.existsSync(rootAssetsDir)) {
    fs.mkdirSync(rootAssetsDir, { recursive: true });
  }
  const files = fs.readdirSync(assetsOutputDir);
  for (const file of files) {
    const src = path.join(assetsOutputDir, file);
    const dest = path.join(rootAssetsDir, file);
    fs.copyFileSync(src, dest);
  }
  console.log(`✅ Copied ${files.length} asset files to root ./assets`);
}

// 2. Copy static files (favicon.png, logo.png, robots.txt) to root
const staticFiles = ["favicon.png", "logo.png", "robots.txt"];
for (const file of staticFiles) {
  const src = path.join(publicOutputDir, file);
  const dest = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file} to root`);
  }
}

// 3. Render and save the complete production SSR HTML to index.html
async function prerenderIndexHtml() {
  const nitroServerPath = path.resolve(rootDir, "frontend/.output/server/index.mjs");
  if (!fs.existsSync(nitroServerPath)) {
    console.warn("⚠️ Nitro server output not found. Skipping SSR prerender.");
    return;
  }

  // Set ephemeral port
  const port = 3099;
  process.env.PORT = String(port);

  try {
    const serverUrl = pathToFileURL(nitroServerPath).href;
    await import(serverUrl);
    console.log(`🚀 Prerendering SSR HTML from http://127.0.0.1:${port}/...`);

    // Give server 600ms to bind
    await new Promise((resolve) => setTimeout(resolve, 600));

    const html = await new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      });
      req.on("error", reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error("Timeout fetching prerendered HTML"));
      });
    });

    if (html && html.includes("<html")) {
      fs.writeFileSync(path.join(rootDir, "index.html"), html, "utf-8");
      console.log(`✅ Successfully generated full SSR pre-rendered index.html (${html.length} bytes)`);
    }
  } catch (err) {
    console.warn("⚠️ SSR Prerender info:", err.message);
    const fallbackPath = path.join(rootDir, "production_rendered_index.html");
    if (fs.existsSync(fallbackPath)) {
      fs.copyFileSync(fallbackPath, path.join(rootDir, "index.html"));
      console.log("✅ Applied production SSR HTML to index.html");
    }
  }
}

await prerenderIndexHtml();
console.log("🎉 Production preparation complete!");
process.exit(0);
