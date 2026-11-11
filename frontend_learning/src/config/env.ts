interface AppEnv {
  apiBaseUrl: string;
  appName: string;
  isDev: boolean;
  isProd: boolean;
}

function read(key: string, fallback: string): string {
  const raw = (import.meta.env as Record<string, string | undefined>)[key];
  return raw && raw.length > 0 ? raw : fallback;
}

export const env: AppEnv = {
  // Backend contract: /api/v1 is the router mount (APPLICATION ARCHITECTURE §5.1).
  apiBaseUrl: read('VITE_API_BASE_URL', 'http://localhost:8000/api/v1'),
  appName: read('VITE_APP_NAME', 'CS Learning Platform'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};