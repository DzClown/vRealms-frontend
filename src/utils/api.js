import axios from 'axios';

// Utility function for cookies
function getCookie(name) {
  const cookieString = document.cookie;
  const cookies = cookieString ? cookieString.split('; ') : [];
  for (let cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (decodeURIComponent(key) === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Interceptor for Authorization header
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Attempting to refresh token...');
      // Panggil endpoint refresh token
      try {
        const refreshResponse = await api.post('/auth/refresh', {
          refreshToken: getCookie('vRealms-dash-refreshToken'),
        });
        document.cookie = `vRealms-dash-accessToken=${refreshResponse.data.accessToken}; path=/;`;
        error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
        return api.request(error.config);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login if refresh fails
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);



export { api };
