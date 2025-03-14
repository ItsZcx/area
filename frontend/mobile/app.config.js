// app.config.js
import 'dotenv/config';

export default ({ config }) => {
    return {
      ...config,
      extra: {
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_OPENID_CONFIG: process.env.GOOGLE_OPENID_CONFIG,
        IOS_CLIENT_ID: process.env.IOS_CLIENT_ID,
        ANDROID_CLIENT_ID: process.env.ANDROID_CLIENT_ID,
        EXPO_WEB_GOOGLE_CLIENT_ID: process.env.EXPO_WEB_GOOGLE_CLIENT_ID,
        EXPO_WEB_GOOGLE_CLIENT_SECRET: process.env.EXPO_WEB_GOOGLE_CLIENT_SECRET,
        GITHUB_MOBILE_CLIENT_ID: process.env.GITHUB_MOBILE_CLIENT_ID,
        GITHUB_MOBILE_CLIENT_SECRET: process.env.GITHUB_MOBILE_CLIENT_SECRET,
      },
    };
  };
  