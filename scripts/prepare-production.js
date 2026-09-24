import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicOutputDir = path.resolve(rootDir, "frontend/.output/public");
const assetsOutputDir = path.resolve(publicOutputDir, "assets");
const rootAssetsDir = path.resolve(rootDir, "assets");

console.log("📦 Preparing production assets and index.html...");

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

// 3. Find latest CSS and JS asset hashes
let cssFile = "styles-LZT9IXFb.css";
let jsFile = "index-Ba8v5GIc.js";

if (fs.existsSync(assetsOutputDir)) {
  const allAssets = fs.readdirSync(assetsOutputDir);
  const foundCss = allAssets.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
  const foundJs = allAssets.find((f) => f.startsWith("index-") && f.endsWith(".js"));
  if (foundCss) cssFile = foundCss;
  if (foundJs) jsFile = foundJs;
}

// 4. Generate root index.html
const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>JAKLOUD – Spice King Dum Biryani | Made To Order Handi Trays</title>
    <meta name="description" content="Authentic royal dum biryani handi trays serving 4–5 adults. Made fresh to order in Springfield, Missouri." />
    <meta name="author" content="JAKLOUD Spice King" />
    <meta name="theme-color" content="#1a120b" />
    <meta property="og:site_name" content="JAKLOUD Spice King" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="JAKLOUD – Spice King Dum Biryani | Made To Order Handi Trays" />
    <meta property="og:description" content="Authentic royal dum biryani handi trays serving 4–5 adults. Made fresh to order in Springfield, Missouri." />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600&family=Poppins:wght@400;500;600;700;800&family=Marcellus&family=Inter:wght@400;500;600;700&display=swap" />
    <link rel="stylesheet" href="/assets/${cssFile}" />
  </head>
  <body class="bg-[#080503] font-sans text-cream">
    <div id="root"></div>
    <script type="module" src="/assets/${jsFile}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(rootDir, "index.html"), indexHtmlContent, "utf-8");
console.log("✅ Generated root index.html");
