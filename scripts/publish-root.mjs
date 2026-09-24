import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

cpSync("public/images", "dist/images", { recursive: true });

const htmlPath = "dist/dev.html";
let html = readFileSync(htmlPath, "utf8");
html = html.replaceAll('src="/src/main.js"', 'src="./assets/app.js"');
html = html.replaceAll('src="/images/', 'src="images/');
html = html.replaceAll('href="/favicon.svg"', 'href="favicon.svg"');

const refs = [...html.matchAll(/(?:src|href)="([^"]+\.(?:jpg|jpeg|png|webp|svg))"/g)].map((match) => match[1]);
if (refs.length === 0) {
  console.error("No image references found in the built homepage.");
  process.exit(1);
}
for (const ref of refs) {
  if (ref.startsWith("/") || ref.includes(":\\") || ref.startsWith("C:")) {
    console.error("Image path must be relative:", ref);
    process.exit(1);
  }
  const file = `dist/${ref.replace(/^\.\//, "")}`;
  if (!existsSync(file)) {
    console.error("Missing deployed image:", file);
    process.exit(1);
  }
}
console.log(`Verified ${refs.length} image files in dist/.`);

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
