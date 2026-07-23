import { getUserId } from "./userId";

async function request(method, body) {
  const userId = getUserId();
  const res = await fetch(`/api/data?userId=${encodeURIComponent(userId)}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
    body: body ? JSON.stringify({ userId, ...body }) : undefined,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || `Request failed (${res.status})`);
  }
  return payload.data;
}

export function fetchCloudData() {
  return request("GET");
}

export function saveCloudData(patch) {
  return request("PUT", patch);
}
