const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(method, path, body) {
  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("ecosphere_token")
        ? { Authorization: `Bearer ${localStorage.getItem("ecosphere_token")}` }
        : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.response = { data, status: response.status };
    throw error;
  }
  return { data, status: response.status };
}

export default {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};
