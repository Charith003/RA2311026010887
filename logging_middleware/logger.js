const API_BASE = process.env.EVAL_API_BASE || "http://20.207.122.201/evaluation-service";
const AUTH_TOKEN = process.env.AUTH_TOKEN;

const STACKS = new Set(["backend", "frontend"]);
const LEVELS = new Set(["debug", "info", "warn", "error", "fatal"]);

const BACKEND_PACKAGES = new Set([
  "cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service",
]);
const FRONTEND_PACKAGES = new Set(["api", "component", "hook", "page", "state", "style"]);
const SHARED_PACKAGES = new Set(["auth", "config", "middleware", "utils"]);

function isValidPackage(stack, pkg) {
  if (SHARED_PACKAGES.has(pkg)) return true;
  if (stack === "backend") return BACKEND_PACKAGES.has(pkg);
  if (stack === "frontend") return FRONTEND_PACKAGES.has(pkg);
  return false;
}

async function Log(stack, level, pkg, message) {
  if (!STACKS.has(stack)) throw new Error(`Invalid stack: ${stack}`);
  if (!LEVELS.has(level)) throw new Error(`Invalid level: ${level}`);
  if (!isValidPackage(stack, pkg)) throw new Error(`Invalid package '${pkg}' for stack '${stack}'`);
  if (typeof message !== "string" || !message.trim()) throw new Error("Message must be a non-empty string");
  if (!AUTH_TOKEN) throw new Error("AUTH_TOKEN is required for protected logging route");

  const res = await fetch(`${API_BASE}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({ stack, level, package: pkg, message }),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`Log API failed: ${res.status} ${details}`);
  }

  return res.json();
}

module.exports = { Log };
