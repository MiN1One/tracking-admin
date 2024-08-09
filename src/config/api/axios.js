import axios from 'axios';
import { getItem } from '../../utility/localStorageControl';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

export const axiosClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    Authorization: `Bearer ${getItem('access_token')}`,
    'Content-Type': 'application/json',
  },
});

/**
 * axios interceptors runs before and after a request, letting the developer modify req,req more
 * For more details on axios interceptor see https://github.com/axios/axios#interceptors
 */
const accessToken = getItem('access_token');
if (accessToken) {
  axiosClient.interceptors.request.use((config) => {
    // do something before executing the request
    // For example tag along the bearer access token to request header or set a cookie
    const requestConfig = config;
    const { headers } = config;
    requestConfig.headers = { ...headers, Authorization: `Bearer ${accessToken}` };

    return requestConfig;
  });
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    /**
     * Do something in case the response returns an error code [3**, 4**, 5**] etc
     * For example, on token expiration retrieve a new access token, retry a failed request etc
     */
    const { response } = error;
    const originalRequest = error.config;
    if (response) {
      if (response.status === 500) {
        // do something here
      } else {
        return originalRequest;
      }
    }
    return Promise.reject(error);
  },
);
