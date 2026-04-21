const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? `http://${window.location.hostname}:5001` : '');
