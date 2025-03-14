# EXAMPLE USING USE USER (hoook)

## example fo the jwt payload

{
  "user_id": 1,
  "username": "john_doe",
  "email": "<john@example.com>",
  "first_name": "John",
  "last_name": "Doe",
  "disabled": false,
  "role": "user",
  "exp": 1716239022
}

```javascript
// App.tsx or any component

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useUser } from './hooks/useUser';

const App = () => {
  const { user, loading, error } = useUser();

  // if not token readicre to login to login
  useEffect(() => {
    if (!loading) {
      if (!user) {
          // Clear any stored data
        await AsyncStorage.removeItem('access_token');
        // Navigate to login screen
        navigation.replace('sign-in');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
        {/* Optionally, redirect to login screen */}
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome, {user?.first_name} {user?.last_name}!</Text>
      {/* Render the rest of your app */}
    </View>
  );
};

export default App;


```
