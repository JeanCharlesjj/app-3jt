import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // 1. Importa o hook

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Pega a função 'signIn' do nosso "rádio"
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o email e a senha.');
      return;
    }

    setIsLoading(true);

    try {
      // 3. Chama a função do Context
      await signIn(email, password);

      // Se o 'await' passou, o login deu certo!
      // O RootNavigator vai reagir automaticamente e trocar a tela.
      // Não precisamos fazer mais NADA aqui.

    } catch (error: any) {
      // 4. O 'signIn' vai jogar um erro se a API falhar
      console.error(error.response?.data || error.message);
      Alert.alert(
        'Falha no Login',
        error.response?.data?.error || 'Não foi possível conectar ao servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login 3JT</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={isLoading ? 'Entrando...' : 'Entrar'}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}

// (Os Estilos continuam os mesmos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
});