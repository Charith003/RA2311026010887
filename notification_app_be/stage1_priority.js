const { Log } = require("../logging_middleware/logger");

const API_BASE = process.env.EVAL_API_BASE || "http://20.207.122.201/evaluation-service";
const AUTH_TOKEN = process.env.AUTH_TOKEN;

const WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function computePriorityScore(notification, minTs, maxTs) {
  const typeWeight = WEIGHTS[notification.Type] || 0;
  const ts = new Date(notification.Timestamp.replace(" ", "T") + "Z").getTime();
  const range = Math.max(1, maxTs - minTs);
  const recency = (ts - minTs) / range;
  return typeWeight * 10 + recency;
}

function topNNotifications(notifications, n = 10) {
  const stamps = notifications.map((x) => new Date(x.Timestamp.replace(" ", "T") + "Z").getTime());
  const minTs = Math.min(...stamps);
  const maxTs = Math.max(...stamps);

  return notifications
    .map((n) => ({ ...n, priorityScore: computePriorityScore(n, minTs, maxTs) }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, n);
}

async function fetchNotifications(page = 1, limit = 100) {
  if (!AUTH_TOKEN) {
    throw new Error("AUTH_TOKEN is required for protected notifications route");
  }

  const url = new URL(`${API_BASE}/notifications`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch notifications: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data.notifications || [];
}

async function main() {
  await Log("backend", "info", "service", "Starting Stage 1 top-N calculation");

  const notifications = await fetchNotifications();
  await Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);

  const top10 = topNNotifications(notifications, 10);

  await Log("backend", "info", "service", "Successfully computed top 10 notifications");
  console.log(JSON.stringify({ top10 }, null, 2));
}

main().catch(async (err) => {
  try {
    await Log("backend", "error", "handler", `Stage 1 execution failed: ${err.message}`);
  } catch (_) {}
  console.error(err);
  process.exit(1);
});
