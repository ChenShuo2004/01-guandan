import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_HOST = "localhost";
const FRONTEND_PORT = 3000;

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), "..");
const nextCli = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const nextCacheDir = path.join(projectRoot, ".next");

let stoppedForPortViolation = false;

function assertPortAvailable(host, port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        reject(
          new Error(
            `Frontend port ${host}:${port} is already in use. Stop that process before running npm run dev.`,
          ),
        );
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(resolve);
    });

    server.listen({ host, port, exclusive: true });
  });
}

function stop(child, message) {
  stoppedForPortViolation = true;
  console.error(message);
  child.kill("SIGTERM");
  process.exitCode = 1;
}

if (!fs.existsSync(nextCli)) {
  console.error("Next.js binary was not found. Run npm install or pnpm install first.");
  process.exit(1);
}

if (fs.existsSync(nextCacheDir)) {
  fs.rmSync(nextCacheDir, { force: true, recursive: true });
  console.log("Cleared stale .next cache before starting dev server.");
}

try {
  await assertPortAvailable(FRONTEND_HOST, FRONTEND_PORT);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [nextCli, "dev", "--hostname", FRONTEND_HOST, "--port", String(FRONTEND_PORT)],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      HOSTNAME: FRONTEND_HOST,
      PORT: String(FRONTEND_PORT),
    },
    stdio: ["inherit", "pipe", "pipe"],
  },
);

function inspectNextOutput(chunk) {
  const text = chunk.toString();

  if (/Port\s+3000\s+is\s+in\s+use/i.test(text) || /trying\s+\d+/i.test(text)) {
    stop(
      child,
      "Next.js attempted to change ports. Dev server is fixed to localhost:3000.",
    );
    return;
  }

  const localUrl = text.match(/Local:\s+https?:\/\/localhost:(\d+)/i);
  if (localUrl && Number(localUrl[1]) !== FRONTEND_PORT) {
    stop(
      child,
      `Next.js started on localhost:${localUrl[1]}, but this project must use localhost:3000.`,
    );
  }
}

child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  inspectNextOutput(chunk);
});
child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  inspectNextOutput(chunk);
});

child.on("exit", (code, signal) => {
  if (stoppedForPortViolation) {
    process.exit(process.exitCode ?? 1);
  }

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}
