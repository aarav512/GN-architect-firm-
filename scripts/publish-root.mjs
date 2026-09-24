import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const htmlPath = "dist/dev.html";
let html = readFileSync(htmlPath, "utf8");
html = html.replaceAll('src="/src/main.js"', 'src="/assets/app.js"');
writeFileSync("dist/index.html", html);
rmSync(htmlPath);

rmSync("assets", { recursive: true, force: true });
mkdirSync("assets", { recursive: true });
for (const file of readdirSync("dist/assets")) {
  cpSync(`dist/assets/${file}`, `assets/${file}`);
}

rmSync("images", { recursive: true, force: true });
cpSync("dist/images", "images", { recursive: true });
cpSync("public/favicon.svg", "favicon.svg");
cpSync("public/_headers", "_headers");
writeFileSync("index.html", html);
console.log("Published dist/index.html and a root copy for static hosting.");
