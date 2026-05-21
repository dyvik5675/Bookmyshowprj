const API_URL = "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = sessionStorage.getItem("bms_token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Something went wrong");
  return data;
}
