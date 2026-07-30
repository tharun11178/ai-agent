/**
 * Helper function to handle API requests seamlessly in local dev,
 * production standalone servers, and Zoho Catalyst hosting environments.
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Read backend web service URL from VITE_API_URL environment variable (Render Web Service)
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.trim() !== '') {
    const baseUrl = envApiUrl.replace(/\/$/, '');
    return `${baseUrl}${cleanEndpoint}`;
  }

  // When deployed on Zoho Catalyst, Advanced I/O function express_app is hosted under /server/express_app/
  const isCatalystEnv =
    window.location.hostname.includes('catalystserverless') ||
    window.location.hostname.includes('zohocatalyst') ||
    window.location.pathname.startsWith('/server/express_app');

  if (isCatalystEnv && !cleanEndpoint.startsWith('/server/express_app')) {
    return `/server/express_app${cleanEndpoint}`;
  }

  return cleanEndpoint;
}

export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(endpoint);
  return fetch(url, options);
}
