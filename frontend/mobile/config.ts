import { Platform } from 'react-native';

// Backend URLs
const API_BASE_URL = "http://localhost:8080/api/v1"; // iOS URL or default URL
const API_BASE_URL_ANDROID = "http://10.0.2.2:8080/api/v1"; // Android URL

// Dynamically choose the correct URL based on the platform
const getApiUrl = () => {
  return Platform.OS === "ios" ? API_BASE_URL : API_BASE_URL_ANDROID;
};

// Export the base URL for easy access throughout the app
export const API_URL = getApiUrl();
