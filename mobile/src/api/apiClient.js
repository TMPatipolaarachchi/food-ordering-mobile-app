import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const normalizeApiBaseUrl = (value) => {
  if (!value) return '';

  let url = value.trim();
  if (!url) return '';

  // Prevent relative URLs in web builds when protocol is omitted.
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  url = url.replace(/\/$/, '');

  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
};

const configuredBaseUrl = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

const getExpoHostBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  if (!hostUri) return '';

  const host = hostUri.replace(/^.*?:\/\//, '').split(':')[0].split('/')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') return '';

  return normalizeApiBaseUrl(`http://${host}:5000`);
};

const fallbackBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const expoHostBaseUrl = getExpoHostBaseUrl();

const BASE_URL = (configuredBaseUrl || expoHostBaseUrl || fallbackBaseUrl).replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    if (!BASE_URL) {
      throw new Error('Missing API base URL. Set EXPO_PUBLIC_API_BASE_URL.');
    }

    // Let the runtime set the multipart boundary for FormData uploads.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers?.['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    }

    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
