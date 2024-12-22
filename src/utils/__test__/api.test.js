import axios from 'axios';

// Mock Axios sebelum memuat `api.js`
jest.mock('axios');

axios.create.mockReturnValue({
  interceptors: {
    request: {
      use: jest.fn(),
    },
  },
  post: jest.fn(),
});

// Impor API setelah mock
import { login, logout, refreshAccessToken } from '../api';

describe('API Handlers', () => {
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Login should store tokens and user data', async () => {
    const mockResponse = {
      data: {
        dataLogin: {
          accessToken: 'mockAccessToken',
          refreshToken: 'mockRefreshToken',
          privilage: ['READ', 'WRITE'],
          role: 'admin',
        },
      },
    };
    axios.create().post.mockResolvedValue(mockResponse);

    const result = await login('testuser', 'testpassword');

    expect(localStorage.getItem('vrealms-dash-accessToken')).toBe('mockAccessToken');
    expect(localStorage.getItem('vrealms-dash-refreshToken')).toBe('mockRefreshToken');
    expect(localStorage.getItem('vrealms-dash-privilage')).toBe(JSON.stringify(['READ', 'WRITE']));
    expect(localStorage.getItem('vrealms-dash-role')).toBe('admin');
    expect(result).toEqual(mockResponse.data);
  });

  test('Logout should clear tokens and user data', async () => {
    localStorage.setItem('vrealms-dash-refreshToken', 'mockRefreshToken');
    axios.create().post.mockResolvedValue({ data: { message: 'Logout successful' } });

    await logout();

    expect(localStorage.getItem('vrealms-dash-accessToken')).toBeNull();
    expect(localStorage.getItem('vrealms-dash-refreshToken')).toBeNull();
  });

  test('RefreshAccessToken should update accessToken', async () => {
    localStorage.setItem('vrealms-dash-refreshToken', 'mockRefreshToken');
    const mockResponse = { data: { accessToken: 'newAccessToken' } };
    axios.create().post.mockResolvedValue(mockResponse);

    const newAccessToken = await refreshAccessToken();

    expect(localStorage.getItem('vrealms-dash-accessToken')).toBe('newAccessToken');
    expect(newAccessToken).toBe('newAccessToken');
  });
});
