import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native'; // Para o loading
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Nossas Telas
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterPurchaseScreen from '../screens/RegisterPurchaseScreen';
import RegisterEmployeeScreen from '../screens/RegisterEmployeeScreen';
import RegisterTractorScreen from '../screens/RegisterTractorScreen';
import ManageTractorsScreen from '../screens/ManageTractorsScreen';
import EditTractorScreen from '../screens/EditTractorScreen';

// Nosso Hook de Autenticação!
import { useAuth } from '../contexts/AuthContext'; // 1. Importa o hook

// (Os tipos de rotas continuam iguais)
type AuthStackParamList = {
  Login: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  RegisterPurchase: undefined;
  RegisterEmployee: undefined;
  RegisterTractor: undefined;
  ManageTractors: undefined;
  EditTractor: { tratorId: string };
};

export type AppScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

export default function RootNavigator() {
  // 2. "Ouve" o Rádio de Autenticação
  const { token, isLoading } = useAuth();

  // 3. Mostra um "Loading..." enquanto o app checa o AsyncStorage
  // (Isso impede o "flash" da tela de login)
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* 4. A decisão agora é baseada no TOKEN do Context */}
      {token ? (
        // Se TEM token: Mostra a pilha principal do App
        <AppStack.Navigator>
          <AppStack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Minhas Compras' }}
          />
          <AppStack.Screen
            name="RegisterPurchase"
            component={RegisterPurchaseScreen}
            options={{ title: 'Registrar Compra' }}
          />
          <AppStack.Screen
            name="RegisterEmployee"
            component={RegisterEmployeeScreen}
            options={{ title: 'Novo Funcionário' }}
          />
          <AppStack.Screen
            name="RegisterTractor"
            component={RegisterTractorScreen}
            options={{ title: 'Nova Máquina' }}
          />
          <AppStack.Screen
            name="ManageTractors"
            component={ManageTractorsScreen}
            options={{ title: 'Gerir Máquinas' }}
          />
          <AppStack.Screen
            name="EditTractor"
            component={EditTractorScreen}
            options={{ title: 'Editar Máquina' }}
          />
        </AppStack.Navigator>
      ) : (
        // Se NÃO tem token: Mostra a pilha de autenticação
        <AuthStack.Navigator>
          <AuthStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}