import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// BASE_URL configured for React Native local bridge over Wi-Fi (Expo network)
// Depending on whether you're using an Android Emulator or Physical Device.
const BASE_URL = 'http://192.168.1.13:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
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
