import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../services/api'; // O nosso 'api.ts'
import { AppScreenProps } from '../navigation/RootNavigator'; // Props de navegação

// Define as props da tela
type Props = AppScreenProps<'RegisterEmployee'>;

export default function RegisterEmployeeScreen({ navigation }: Props) {
  // 1. Estados para o formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Função de Submit
  const handleRegister = async () => {
    // Validação
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // 3. A chamada à API
      // O token do *gerente* (que está logado) já está a ser enviado
      // no cabeçalho pelo AuthContext, o que autoriza esta rota.
      await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'employee', // O gerente está a criar um 'employee'
      });

      // 4. Sucesso
      Alert.alert(
        'Sucesso!',
        `Funcionário ${name} cadastrado com sucesso.`
      );
      navigation.goBack(); // Volta para a HomeScreen
      
    } catch (error: any) {
      // 5. Erro
      console.error(error.response?.data);
      Alert.alert(
        'Falha no Cadastro',
        error.response?.data?.error || 'Não foi possível cadastrar o funcionário.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome Completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do funcionário"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="email@empresa.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Senha Provisória</Text>
      <TextInput
        style={styles.input}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Cadastrando...' : 'Cadastrar Funcionário'}
          onPress={handleRegister}
          disabled={isLoading}
        />
      </View>
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
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
  buttonContainer: {
    marginTop: 20,
  },
});