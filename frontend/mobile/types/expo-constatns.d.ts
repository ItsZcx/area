// types/expo-constants.d.ts
import 'expo-constants';

declare module 'expo-constants' {
  export interface Constants {
    expoConfig: {
      extra: {
        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        GOOGLE_OPENID_CONFIG: string;
        IOS_CLIENT_ID: string;
        ANDROID_CLIENT_ID: string;
        EXPO_WEB_GOOGLE_CLIENT_ID: string;
        // new
        GITHUB_MOBILE_CLIENT_ID: string;
        GITHUB_MOBILE_CLIENT_SECRET: string;
      };
    };
  }
}
