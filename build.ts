const result = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  minify: true,
  sourcemap: "linked",
});

if (!result.success) {
  console.error("Build failed:");
  for (const msg of result.logs) {
    console.error(msg);
  }
  process.exit(1);
}

const { default: sharp } = await import("sharp");
await sharp("./src/poly.png")
  .resize(1200, 630, { fit: "cover" })
  .jpeg({ quality: 85 })
  .toFile("./dist/og-image.jpg");
console.log("Generated optimized og-image.jpg");

console.log("Build complete → dist/");
