import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nitroServerPath = path.resolve(__dirname, "frontend/.output/server/index.mjs");
const backendDistPath = path.resolve(__dirname, "backend/dist/server.js");

if (fs.existsSync(nitroServerPath)) {
  console.log("🚀 Starting JAKLOUD Production Server from Nitro output...");
  await import("./frontend/.output/server/index.mjs");
} else if (fs.existsSync(backendDistPath)) {
  console.log("🚀 Fallback: Starting backend API server...");
  await import("./backend/dist/server.js");
} else {
  const http = await import("node:http");
  const port = process.env.PORT || 3000;
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>JAKLOUD Spice King Dum Biryani</h1><p>Building application... Please refresh in a moment.</p>");
  });
  server.listen(port, () => {
    console.log(`JAKLOUD temporary server listening on port ${port}`);
  });
}
