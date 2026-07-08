import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND_HOST = "localhost";
const BACKEND_PORT = 8000;

const backendPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(backendPath), "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvFile(path.join(projectRoot, ".env"));
loadEnvFile(path.join(projectRoot, ".env.local"));

const frontendOrigin = process.env.FRONTEND_ORIGIN;

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...(frontendOrigin ? { "Access-Control-Allow-Origin": frontendOrigin } : {}),
  });
  response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...(frontendOrigin ? { "Access-Control-Allow-Origin": frontendOrigin } : {}),
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Backend port ${BACKEND_HOST}:${BACKEND_PORT} is already in use. Stop that process before running npm run dev:backend.`,
    );
    process.exit(1);
  }

  throw error;
});

server.listen(BACKEND_PORT, BACKEND_HOST, () => {
  const address = server.address();

  if (!address || typeof address === "string" || address.port !== BACKEND_PORT) {
    console.error("Backend attempted to start on an unexpected port.");
    server.close(() => process.exit(1));
    return;
  }

  console.log(`Backend dev server ready on http://${BACKEND_HOST}:${BACKEND_PORT}`);
});
