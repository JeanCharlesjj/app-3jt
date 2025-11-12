import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext'; // 1. Importa o Provedor

export default function App() {
  return (
    // 2. Envelopa tudo com o AuthProvider
    <AuthProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </AuthProvider>
  );
}