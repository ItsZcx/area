import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Redirect, useRootNavigationState } from 'expo-router';
import { useUser } from '../hooks/useUser';

export default function Index() {
  const { user, loading, error } = useUser();

  if (error) {
    return <Text>{error}</Text>
  }

  if (loading) {
    return <Text>Loading...</Text>
  }
  
  if (user) {
    return <Redirect href="/(app)/dashboard" />;
  } else {
    return <Redirect href="/(auth)/sign-in" />;
  }
}
