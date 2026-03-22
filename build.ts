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

console.log("Build complete → dist/");
