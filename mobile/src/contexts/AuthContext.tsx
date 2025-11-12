import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api'; // Nosso 'api.ts'

// --- Definindo os Tipos ---

// O que vamos salvar sobre o usuário
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee';
}

// O que o nosso "Rádio" (Context) vai transmitir
interface AuthContextData {
  user: User | null; // O usuário logado, ou null
  token: string | null; // O token JWT
  isLoading: boolean; // Para mostrar um "Loading..."
  signIn(email: string, password: string): Promise<void>; // Função de Login
  signOut(): void; // Função de Logout
}

// --- Criando o Context ---
// Começa vazio, pois será preenchido pelo "Provider"
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// --- Criando o "Provedor" (Quem gerencia o estado) ---
// Este componente vai "envelopar" nosso app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa true para checar o storage

  // Efeito que roda UMA VEZ quando o app abre
  useEffect(() => {
    async function loadStorageData() {
      try {
        // Tenta buscar o token e o usuário salvos no "porta-luvas"
        const storedToken = await AsyncStorage.getItem('@3JT:token');
        const storedUser = await AsyncStorage.getItem('@3JT:user');

        if (storedToken && storedUser) {
          // Se achou, coloca o token no cabeçalho de TODAS as requisições futuras
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Falha ao carregar dados do storage', e);
      } finally {
        setIsLoading(false); // Termina o loading (app pode continuar)
      }
    }
    loadStorageData();
  }, []);

  // --- Função de LOGIN ---
  const signIn = async (email: string, password: string) => {
    // A lógica de login que estava na LoginScreen
    const response = await api.post('/auth/login', { email, password });

    const { token: apiToken, user: apiUser } = response.data;

    // Salva os dados no "porta-luvas" (AsyncStorage)
    await AsyncStorage.setItem('@3JT:token', apiToken);
    await AsyncStorage.setItem('@3JT:user', JSON.stringify(apiUser));

    // Coloca o token no cabeçalho do 'api' para futuras requisições
    api.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;

    // Atualiza os estados (o app vai re-renderizar)
    setUser(apiUser);
    setToken(apiToken);
  };

  // --- Função de LOGOUT ---
  const signOut = async () => {
    // Limpa o "porta-luvas"
    await AsyncStorage.removeItem('@3JT:token');
    await AsyncStorage.removeItem('@3JT:user');

    // Limpa os estados (o app vai re-renderizar e mostrar a tela de login)
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook customizado ---
// Facilita para os componentes usarem o "rádio"
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}