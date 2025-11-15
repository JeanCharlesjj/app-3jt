import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

// Telas de Auth
import LoginScreen from '../screens/LoginScreen';

// O NOSSO NOVO MENU LATERAL
import DrawerNavigator from './DrawerNavigator'; 

// Hook de Autenticação
import { useAuth } from '../contexts/AuthContext';


import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { DrawerParamList } from './DrawerNavigator';

// 1. Define os parâmetros para cada "Pilha" (Stack)
// Estas são as telas "filhas"

export type HomeStackParamList = {
  Home: undefined;
  RegisterPurchase: undefined;
};

export type TractorStackParamList = {
  ManageTractors: undefined;
  RegisterTractor: undefined;
  EditTractor: { tratorId: string };
};

export type EmployeeStackParamList = {
  ManageEmployees: undefined;
  RegisterEmployee: undefined;
  // EditEmployee: { employeeId: string }; // (Quando o fizermos)
};

// Tipos
type AuthStackParamList = {
  Login: undefined;
};

// O AppStack foi movido para dentro do Drawer,
// mas a navegação de Compras e Edição ainda usa Stack.
// Vamos precisar refatorar o AppStack.
// Por agora, vamos simplificar.

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? (
        // Se TEM token: Mostra o MENU LATERAL (Drawer)
        <DrawerNavigator />
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