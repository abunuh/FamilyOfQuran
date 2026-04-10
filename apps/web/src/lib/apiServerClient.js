const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const isLocalhost = LOCAL_HOSTNAMES.has(window.location.hostname);

const API_SERVER_URL = (import.meta.env.VITE_API_BASE_URL || (isLocalhost ? '/api' : '/hcgi/api')).replace(/\/$/, '');

const apiServerClient = {
    fetch: async (url, options = {}) => {
        const normalizedPath = url.startsWith('/') ? url : `/${url}`;
        return await window.fetch(`${API_SERVER_URL}${normalizedPath}`, options);
    }
};

export default apiServerClient;

export { apiServerClient };
