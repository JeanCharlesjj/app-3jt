import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import api from '../services/api'; // Nosso 'api.ts'
import { AppScreenProps } from '../navigation/RootNavigator'; // Props de navegação

// Define as props da tela
type Props = AppScreenProps<'EditTractor'>;

export default function EditTractorScreen({ navigation, route }: Props) {
  // 1. Pega o ID do trator que veio pela navegação
  const { tratorId } = route.params;

  // 2. Estados para o formulário
  const [name, setName] = useState('');
  const [modelName, setModelName] = useState('');
  const [plate, setPlate] = useState('');

  // 3. Estados de Loading
  // isLoading (para o fetch inicial)
  // isSubmitting (para o botão de salvar)
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Efeito que busca os dados do trator QUANDO A TELA ABRE
  useEffect(() => {
    async function fetchTractorData() {
      try {
        const response = await api.get(`/tratores/${tratorId}`);
        const { name, modelName, plate } = response.data;
        
        // 5. Preenche o formulário com os dados do backend
        setName(name);
        setModelName(modelName || '');
        setPlate(plate || '');
        
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível carregar os dados da máquina.', [
          // Adiciona um botão que volta a tela
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setIsLoading(false); // Para o loading do fetch
      }
    }

    fetchTractorData();
  }, [tratorId, navigation]); // Depende do tratorId

  // 6. Função de SUBMIT (Salvar Edição)
  const handleUpdate = async () => {
    if (!name) {
      Alert.alert('Erro', 'O nome da máquina é obrigatório.');
      return;
    }

    setIsSubmitting(true); // Ativa o loading do botão

    try {
      // 7. Chama a rota PUT com os novos dados
      await api.put(`/tratores/${tratorId}`, {
        name,
        modelName,
        plate,
      });

      // 8. Sucesso
      Alert.alert('Sucesso!', 'Máquina atualizada.');
      navigation.goBack(); // Volta para a tela de Gestão
      
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert(
        'Falha ao Atualizar',
        error.response?.data?.error || 'Não foi possível atualizar a máquina.'
      );
    } finally {
      setIsSubmitting(false); // Libera o botão
    }
  };

  // 9. Mostra um loading principal enquanto busca os dados
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
      <Text style={styles.label}>Nome da Máquina (Obrigatório)</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Modelo (Opcional)</Text>
      <TextInput
        style={styles.input}
        value={modelName}
        onChangeText={setModelName}
      />

      <Text style={styles.label}>Placa / Identificador (Opcional)</Text>
      <TextInput
        style={styles.input}
        value={plate}
        onChangeText={setPlate}
        autoCapitalize="characters"
      />

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

// --- Estilos (são os mesmos do RegisterTractorScreen) ---
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
  buttonContainer: {
    marginTop: 20,
  },
});