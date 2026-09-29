import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${npm} ${args.join(" ")} failed (${code ?? signal})`));
    });
  });
}

async function waitForSite(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`G4 frontend did not become ready at ${url}`);
}

const root = resolve(process.cwd());
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://127.0.0.1").pathname;
    const relative = pathname === "/" ? "index.html" : pathname.slice(1);
    const file = resolve(root, relative);
    if (file !== root && !file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type": contentTypes[extname(file)] || "application/octet-stream",
      "cache-control": "no-store",
    }).end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await run(["run", "validate"]);

await new Promise((resolveListen, reject) => {
  server.once("error", reject);
  server.listen(4173, "127.0.0.1", resolveListen);
});
try {
  await waitForSite("http://127.0.0.1:4173/index.html");
  await run(["run", "test:a11y:pa11y"]);
  await run(["run", "test:a11y:axe"]);
} finally {
  await new Promise((resolveClose, reject) => {
    server.close((error) => (error ? reject(error) : resolveClose()));
  });
}

await run(["--prefix", "sites/salvacion-m", "run", "build"]);
await run(["--prefix", "sites/salvacion-m", "test"]);
