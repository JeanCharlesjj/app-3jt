import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, TractorStackParamList, EmployeeStackParamList } from './RootNavigator';

// Combina todos os tipos de Stacks
export type AppStackParamList = 
  HomeStackParamList & 
  TractorStackParamList & 
  EmployeeStackParamList;

// O novo AppScreenProps genérico
export type AppScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;