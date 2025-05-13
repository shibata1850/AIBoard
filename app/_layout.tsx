import React from 'react';
import { Tabs, Slot, Stack } from 'expo-router';
import { View, Text, Button, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { ThemeProvider } from '../components/ThemeProvider';
import { AuthProvider } from '../components/AuthProvider';
import { useAuth } from '../components/AuthProvider';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import {
  MessageSquare,
  History,
  MessageSquareMore,
  BookMarked,
  FileText,
  CircleHelp,
  Settings,
} from 'lucide-react-native';
import { useTheme } from '../components/ThemeProvider';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>エラーが発生しました</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Button title="再試行" onPress={resetErrorBoundary} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(auth)"
        redirect={!isLoading && !!user}
      />
      <Stack.Screen
        name="(app)"
        redirect={!isLoading && !user}
      />
      <Stack.Screen
        name="index"
        redirect={true}
      />
    </Stack>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    marginBottom: 20,
    textAlign: 'center',
  },
});
