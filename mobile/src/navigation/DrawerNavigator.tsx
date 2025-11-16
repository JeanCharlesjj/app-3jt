import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Importa os NOSSOS TIPOS
import { HomeStackParamList, TractorStackParamList, EmployeeStackParamList } from './RootNavigator';

// Importa TODAS as telas
import HomeScreen from '../screens/HomeScreen';
import RegisterPurchaseScreen from '../screens/RegisterPurchaseScreen';
import PurchaseDetailScreen from '../screens/PurchaseDetailScreen';

import ManageTractorsScreen from '../screens/ManageTractorsScreen';
import RegisterTractorScreen from '../screens/RegisterTractorScreen';
import EditTractorScreen from '../screens/EditTractorScreen';

import ManageEmployeesScreen from '../screens/ManageEmployeesScreen';
import RegisterEmployeeScreen from '../screens/RegisterEmployeeScreen';
import EditEmployeeScreen from '../screens/EditEmployeeScreen';

/*
* ============================================
* 1. CRIA AS PILHAS (STACKS)
* ============================================
*/

const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} />
      <HomeStackNav.Screen name="RegisterPurchase" component={RegisterPurchaseScreen} />
      <HomeStackNav.Screen name="PurchaseDetail" component={PurchaseDetailScreen} />
    </HomeStackNav.Navigator>
  );
}

const TractorStackNav = createNativeStackNavigator<TractorStackParamList>();
function TractorStack() {
  return (
    <TractorStackNav.Navigator screenOptions={{ headerShown: false }}>
      <TractorStackNav.Screen name="ManageTractors" component={ManageTractorsScreen} />
      <TractorStackNav.Screen name="RegisterTractor" component={RegisterTractorScreen} />
      <TractorStackNav.Screen name="EditTractor" component={EditTractorScreen} />
    </TractorStackNav.Navigator>
  );
}

const EmployeeStackNav = createNativeStackNavigator<EmployeeStackParamList>();
function EmployeeStack() {
  return (
    <EmployeeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <EmployeeStackNav.Screen name="ManageEmployees" component={ManageEmployeesScreen} />
      <EmployeeStackNav.Screen name="RegisterEmployee" component={RegisterEmployeeScreen} />
      <EmployeeStackNav.Screen name="EditEmployee" component={EditEmployeeScreen} />
    </EmployeeStackNav.Navigator>
  );
}

/*
* ============================================
* 2. CRIA O MENU LATERAL (DRAWER)
* (Agora ele usa as Pilhas como componentes)
* ============================================
*/

// Define os tipos do Drawer
export type DrawerParamList = {
  Dashboard: undefined; // Nome que aparece no menu
  Maquinas: undefined; // Nome que aparece no menu
  Funcionarios: undefined; // Nome que aparece no menu
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  const { user } = useAuth();

  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>

      {/* Item 1: O Dashboard (que é a Pilha Home) */}
      <Drawer.Screen
        name="Dashboard"
        component={HomeStack}
        options={{ title: 'Dashboard de Compras' }}
      />

      {/* Telas SÓ PARA O GERENTE */}
      {user?.role === 'manager' && (
        <>
          {/* Item 2: Máquinas (que é a Pilha Tractor) */}
          <Drawer.Screen
            name="Maquinas"
            component={TractorStack}
            options={{ title: 'Gerir Máquinas' }}
          />

          {/* Item 3: Funcionários (que é a Pilha Employee) */}
          <Drawer.Screen
            name="Funcionarios"
            component={EmployeeStack}
            options={{ title: 'Gerir Funcionários' }}
          />
        </>
      )}

    </Drawer.Navigator>
  );
}