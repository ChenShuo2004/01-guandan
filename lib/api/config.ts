const API_BASE_URL_ENV = "NEXT_PUBLIC_API_BASE_URL";

export function getApiBaseUrl() {
  const apiBaseUrl = process.env[API_BASE_URL_ENV];

  if (!apiBaseUrl) {
    throw new Error(`Missing ${API_BASE_URL_ENV}. Copy .env.example to .env.local.`);
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}
