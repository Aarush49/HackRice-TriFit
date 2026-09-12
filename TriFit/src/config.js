import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  // 1. If explicitly set in environment/config, use it
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Extract host/IP when running dynamically via Expo Go or Metro dev server
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || Constants.manifest?.debuggerHost;

  if (hostUri) {
    // hostUri usually looks like "192.168.1.50:8081" or "10.0.0.12:19000"
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:8000`;
    }
  }

  // 3. Fallback for physical devices / emulators / web
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000'; // Android emulator localhost alias
  }

  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
