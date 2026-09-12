import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LAN_FALLBACK_IP = '172.20.10.2'; // Machine local hotspot/LAN IP

const getApiBaseUrl = () => {
  // 1. If explicitly set in environment/config, use it
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser on same PC or LAN
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `http://${window.location.hostname}:8000`;
    }
    return 'http://localhost:8000';
  }

  // 3. Extract host/IP when running dynamically via Expo Go or Metro dev server
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host);
    if (isIp && host !== '127.0.0.1' && host !== 'localhost') {
      return `http://${host}:8000`;
    }
    // In tunnel mode (*.exp.direct or *.ngrok), port 8000 is not tunneled, so connect directly to host PC LAN IP:
    return `http://${LAN_FALLBACK_IP}:8000`;
  }

  // 4. Fallback for Android emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  // 5. Fallback for physical iOS device
  return `http://${LAN_FALLBACK_IP}:8000`;
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;

