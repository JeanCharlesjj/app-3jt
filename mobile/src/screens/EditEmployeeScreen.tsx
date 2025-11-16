import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,Button,StyleSheet,Alert,ScrollView,ActivityIndicator} from 'react-native';
import api from '../services/api'; // O nosso 'api.ts'
import { AppScreenProps } from '../navigation/types'; // Os nossos tipos
import { Picker } from '@react-native-picker/picker'; // Vamos precisar do Picker

// Define as props da tela
type Props = AppScreenProps<'EditEmployee'>;

export default function EditEmployeeScreen({ navigation, route }: Props) {
  // 1. Pega o ID do funcionário que veio pela navegação
  const { employeeId } = route.params;

  // 2. Estados para o formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'manager'>('employee');

  // 3. Estados de Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Efeito que busca os dados do funcionário QUANDO A TELA ABRE
  useEffect(() => {
    async function fetchEmployeeData() {
      try {
        // Usa a nova rota que acabámos de criar no backend
        const response = await api.get(`/users/${employeeId}`);
        const { name, email, role } = response.data;
        
        // 5. Preenche o formulário com os dados
        setName(name);
        setEmail(email);
        setRole(role);
        
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do funcionário.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployeeData();
  }, [employeeId, navigation]);

  // 6. Função de SUBMIT (Salvar Edição)
  const handleUpdate = async () => {
    if (!name || !email) {
      Alert.alert('Erro', 'Nome e Email são obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 7. Chama a rota PUT
      await api.put(`/users/${employeeId}`, {
        name,
        email,
        role,
      });

      // 8. Sucesso
      Alert.alert('Sucesso!', 'Funcionário atualizado.');
      navigation.goBack(); // Volta para a tela de Gestão
      
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert(
        'Falha ao Atualizar',
        error.response?.data?.error || 'Não foi possível atualizar o funcionário.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 9. Mostra um loading principal
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 10. O formulário pré-preenchido
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome Completo</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Função (Role)</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Funcionário" value="employee" />
          <Picker.Item label="Gerente" value="manager" />
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          onPress={handleUpdate}
          disabled={isSubmitting}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
  },
});