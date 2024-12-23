import axios from 'axios';

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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.map((cb) => cb(newToken));
  refreshSubscribers = [];
};

api.interceptors.request.use(
  (config) => {
    const accessToken = getCookie('vrealms-dash-admin-accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshResponse = await api.post('/auth/refresh', {
            refreshToken: getCookie('vrealms-dash-admin-refreshToken'),
          });

          document.cookie = `vrealms-dash-admin-accessToken=${refreshResponse.data.accessToken}; path=/;`;
          onTokenRefreshed(refreshResponse.data.accessToken);
          isRefreshing = false;

          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export { api };
