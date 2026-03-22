import homepage from "./src/index.html";

const server = Bun.serve({
  port: parseInt(process.env.PORT || "3000"),
  routes: {
    "/": homepage,
  },
  development: true,
});

console.log(`Dev server: http://localhost:${server.port}`);
