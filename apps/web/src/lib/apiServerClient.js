const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const isLocalhost = LOCAL_HOSTNAMES.has(window.location.hostname);

const API_SERVER_URL = (import.meta.env.VITE_API_BASE_URL || (isLocalhost ? '/api' : '/hcgi/api')).replace(/\/$/, '');

console.log('[apiServerClient] Base URL resolved to:', API_SERVER_URL);

const apiServerClient = {
    fetch: async (url, options = {}) => {
        const normalizedPath = url.startsWith('/') ? url : `/${url}`;
        const fullUrl = `${API_SERVER_URL}${normalizedPath}`;
        console.log('[apiServerClient] Fetching:', fullUrl, options);
        const response = await window.fetch(fullUrl, options);
        console.log('[apiServerClient] Response:', response.status, response.statusText, 'url:', response.url);
        return response;
    }
};

export default apiServerClient;

export { apiServerClient };
