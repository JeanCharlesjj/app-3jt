import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { AppScreenProps } from '../navigation/types';
import api from '../services/api'; // Nosso 'api.ts'
import { Picker } from '@react-native-picker/picker'; // O seletor que instalamos

// 1. Define o tipo do Trator
interface Trator {
  _id: string;
  name: string;
  plate: string;
}

// 2. Define os campos do formulário
interface FormData {
  description: string;
  value: string; // Começa como string
  category: 'combustivel' | 'pecas' | 'manutencao' | 'outros';
  paymentMethod: 'pix' | 'boleto' | 'cartao_debito' | 'cartao_credito';
  tratorId: string | null; // ID do trator selecionado
}

// Define as props da tela
type Props = AppScreenProps<'RegisterPurchase'>;

export default function RegisterPurchaseScreen({ navigation }: Props) {
  // --- Estados ---
  const [formData, setFormData] = useState<FormData>({
    description: '',
    value: '',
    category: 'combustivel', // Valor padrão
    paymentMethod: 'pix', // Valor padrão
    tratorId: null,
  });
  const [tratores, setTratores] = useState<Trator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTratores, setIsFetchingTratores] = useState(true);

  // 3. Efeito que roda UMA VEZ para buscar os tratores
  useEffect(() => {
    async function fetchTratores() {
      try {
        const response = await api.get('/tratores');
        setTratores(response.data);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar a lista de máquinas.');
      } finally {
        setIsFetchingTratores(false);
      }
    }
    fetchTratores();
  }, []);

  // 4. Função para atualizar o formulário
  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 5. Função de SUBMIT (Salvar)
  const handleSubmit = async () => {
    const { description, value, category, paymentMethod, tratorId } = formData;

    // Validação
    if (!description || !value || !tratorId) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }
    const numericValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert('Erro', 'O valor inserido é inválido.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/compras', {
        description,
        value: numericValue,
        category,
        paymentMethod,
        tratorId,
        purchaseDate: new Date(), // Envia a data atual
      });

      Alert.alert('Sucesso!', 'Compra registrada.');
      navigation.goBack(); // Volta para a HomeScreen
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert(
        'Falha ao Salvar',
        error.response?.data?.error || 'Não foi possível registrar a compra.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Se ainda estiver buscando tratores, mostra um loading
  if (isFetchingTratores) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text>Carregando máquinas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Descrição da Compra</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Óleo Diesel S10"
        value={formData.description}
        onChangeText={(text) => handleChange('description', text)}
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 150,00"
        keyboardType="numeric"
        value={formData.value}
        onChangeText={(text) => handleChange('value', text)}
      />

      <Text style={styles.label}>Máquina (Trator)</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.tratorId}
          onValueChange={(itemValue) => setFormData((prev) => ({ ...prev, tratorId: itemValue }))}
        >
          <Picker.Item label="-- Selecione uma máquina --" value={null} />
          {tratores.map((trator) => (
            <Picker.Item
              key={trator._id}
              label={`${trator.name} (${trator.plate || 'N/A'})`}
              value={trator._id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.category}
          onValueChange={(itemValue) => handleChange('category', itemValue)}
        >
          <Picker.Item label="Combustível" value="combustivel" />
          <Picker.Item label="Peças" value="pecas" />
          <Picker.Item label="Manutenção" value="manutencao" />
          <Picker.Item label="Outros" value="outros" />
        </Picker>
      </View>

      <Text style={styles.label}>Forma de Pagamento</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.paymentMethod}
          onValueChange={(itemValue) => handleChange('paymentMethod', itemValue)}
        >
          <Picker.Item label="Pix" value="pix" />
          <Picker.Item label="Boleto" value="boleto" />
          <Picker.Item label="Cartão de Débito" value="cartao_debito" />
          <Picker.Item label="Cartão de Crédito" value="cartao_credito" />
        </Picker>
      </View>

      <Button
        title={isLoading ? 'Salvando...' : 'Salvar Compra'}
        onPress={handleSubmit}
        disabled={isLoading}
      />
      <View style={{ height: 50 }} />
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
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
});