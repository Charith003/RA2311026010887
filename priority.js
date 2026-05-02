
// Priority weights
const WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

// Compute score
export function getScore(notification) {
  const weight = WEIGHTS[notification.Type] || 0;
  const time = new Date(notification.Timestamp).getTime();
  return weight * 1e13 + time;
}

// Get top N notifications
export function getTopNotifications(data, n = 10) {
  return [...data]
    .map(noti => ({ ...noti, score: getScore(noti) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

👉 This is clean, readable, and sufficient for frontend (heap is not required here).