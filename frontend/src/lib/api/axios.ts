import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000/api/v1',
  timeout: 10000, // 10 second timeout for production
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
  },
  withCredentials: true,
});

// For SSR/Node.js requests only: explicitly set Origin and (requested) ACAO
// Browsers do not allow setting these headers via JS; they are managed by the browser.
if (typeof window === 'undefined') {
  const clientOrigin = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';
  instance.defaults.headers.common['Origin'] = clientOrigin;
  // Note: Access-Control-Allow-Origin is a response header; setting it on requests has no effect,
  // but it's included here per request for non-browser environments.
  (instance.defaults.headers.common as any)['Access-Control-Allow-Origin'] = clientOrigin;
}

// Runtime checks to help verify CORS in the browser
if (typeof window !== 'undefined') {
  // Log request origin and withCredentials
  instance.interceptors.request.use((config) => {
    try {
      const origin = window.location.origin;
      if (process.env.NODE_ENV !== 'production') {
        // Useful when validating: Origin should be your Vercel URL
        console.debug('[Axios][Request]', {
          url: (config.baseURL || '') + (config.url || ''),
          origin,
          withCredentials: config.withCredentials,
        });
      }
    } catch {}
    return config;
  });

  // Log response CORS headers and cookie visibility notes
  const logResponse = (response: any) => {
    try {
      const acao = response?.headers?.['access-control-allow-origin'];
      const acc = response?.headers?.['access-control-allow-credentials'];
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[Axios][Response CORS]', {
          accessControlAllowOrigin: acao,
          accessControlAllowCredentials: acc,
        });
        // HttpOnly cookies (recommended) won't be visible in document.cookie
        console.debug('[Axios][Cookies Notice]', {
          note: 'HttpOnly cookies are not readable via JS; this is expected.',
          visibleCookies: typeof document !== 'undefined' ? document.cookie : undefined,
        });
      }
    } catch {}
  };

  instance.interceptors.response.use(
    (response) => {
      logResponse(response);
      return response;
    },
    (error) => {
      if (error?.response) {
        logResponse(error.response);
      }
      return Promise.reject(error);
    }
  );
}

export default instance;
