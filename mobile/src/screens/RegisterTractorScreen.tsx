import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView }from 'react-native';
import api from '../services/api'; // O nosso 'api.ts'
import { AppScreenProps } from '../navigation/types';

// Define as props da tela
type Props = AppScreenProps<'RegisterTractor'>;

export default function RegisterTractorScreen({ navigation }: Props) {
  // 1. Estados para o formulário
  const [name, setName] = useState('');
  const [modelName, setModelName] = useState(''); // Opcional
  const [plate, setPlate] = useState(''); // Opcional

  const [isLoading, setIsLoading] = useState(false);

  // 2. Função de Submit
  const handleRegister = async () => {
    // Validação (O 'name' é o único obrigatório pelo nosso Model)
    if (!name) {
      Alert.alert('Erro', 'O nome da máquina é obrigatório.');
      return;
    }

    setIsLoading(true);

    try {
      // 3. A chamada à API
      // O token do utilizador logado (seja gerente ou funcionário)
      // já está a ser enviado no cabeçalho pelo AuthContext.
      await api.post('/tratores', {
        name,
        modelName,
        plate,
      });

      // 4. Sucesso
      Alert.alert('Sucesso!', `Máquina ${name} cadastrada.`);
      navigation.goBack(); // Volta para a HomeScreen
      
    } catch (error: any) {
      // 5. Erro (Ex: Se a 'plate' (placa) já existir)
      console.error(error.response?.data);
      Alert.alert(
        'Falha no Cadastro',
        error.response?.data?.error || 'Não foi possível cadastrar a máquina.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome da Máquina (Obrigatório)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Trator Valtra A950"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Modelo (Opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: A950"
        value={modelName}
        onChangeText={setModelName}
      />

      <Text style={styles.label}>Placa / Identificador (Opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: ABC-1234 (Deve ser único)"
        value={plate}
        onChangeText={setPlate}
        autoCapitalize="characters" // Facilita para placas
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Cadastrando...' : 'Cadastrar Máquina'}
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