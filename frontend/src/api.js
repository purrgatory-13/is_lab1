const BASE_URL = 'http://localhost:8080/is_lab1';
const TOKEN_KEY = 'jwt_token';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearToken();
        window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return response;
}

export function createEventSource() {
    const token = getToken();
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return new EventSource(`${BASE_URL}/events${query}`);
}