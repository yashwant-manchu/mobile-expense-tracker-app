import { router, Stack } from "expo-router";
import "./globals.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";

function Layout() {
  const { user, authStatus } = useAuth();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/(tabs)');
    } else if (authStatus === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [authStatus]);

  if (authStatus === 'checking') {
    return (
      <View className="absolute inset-0 items-center justify-center bg-black bg-opacity-50">
        <ActivityIndicator size="large" color="#00ADB5" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="auth/login" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
