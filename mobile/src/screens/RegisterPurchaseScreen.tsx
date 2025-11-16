import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image, // Para mostrar a imagem
  TouchableOpacity, // Para botões de imagem
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // O Image Picker
import api from '../services/api'; // O nosso 'api.ts'
import { AppScreenProps } from '../navigation/types'; // Os nossos tipos
import { Picker } from '@react-native-picker/picker'; // O seletor

// --- Interfaces ---

// Define o tipo do Trator
interface Trator {
  _id: string;
  name: string;
  plate: string;
}

// Define os campos do formulário
interface FormData {
  description: string;
  value: string; // Começa como string
  category: 'combustivel' | 'pecas' | 'manutencao' | 'outros';
  paymentMethod: 'pix' | 'boleto' | 'cartao_debito' | 'cartao_credito';
  tratorId: string | null; // ID do trator selecionado
}

// Define o tipo da imagem selecionada
interface SelectedImage {
  uri: string; // Caminho local do ficheiro no telemóvel
  type: string; // Ex: 'image/jpeg'
  name: string; // Ex: 'foto.jpg'
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
  const [isLoading, setIsLoading] = useState(false); // Loading do botão "Salvar"
  const [isFetchingTratores, setIsFetchingTratores] = useState(true); // Loading dos tratores
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  // --- Efeito: Buscar Tratores ---
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

  // --- Funções Auxiliares ---

  // Atualiza o formulário (para inputs de texto e pickers simples)
  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Pede permissão para câmara e galeria
  const requestPermissions = async () => {
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (galleryStatus !== 'granted') {
      Alert.alert('Erro', 'Precisamos da permissão da galeria para isto funcionar.');
      return false;
    }
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert('Erro', 'Precisamos da permissão da câmara para isto funcionar.');
      return false;
    }
    return true;
  };

  // Abre a câmara ou galeria
  const handlePickImage = async (type: 'gallery' | 'camera') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result;
    try {
      if (type === 'gallery') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        const asset = result.assets[0];
        const uriParts = asset.uri.split('/');
        const fileName = uriParts.pop() || 'image.jpg';
        const fileType = asset.mimeType || `image/${fileName.split('.').pop()}`;

        setSelectedImage({
          uri: asset.uri,
          type: fileType,
          name: fileName,
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a imagem.');
      console.error(error);
    }
  };

  // --- Função Principal: Salvar ---
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
      // Cria um FormData para enviar a imagem
      const data = new FormData();

      // Adiciona os campos de texto
      data.append('description', description);
      data.append('value', String(numericValue));
      data.append('category', category);
      data.append('paymentMethod', paymentMethod);
      data.append('tratorId', tratorId);
      data.append('purchaseDate', new Date().toISOString());

      // Adiciona o ficheiro (se existir)
      if (selectedImage) {
        data.append('receiptImage', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.name,
        } as any);
      }

      // Envia o FormData para a API
      await api.post('/compras', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Sucesso!', 'Compra registada.');
      navigation.goBack(); // Volta para a HomeScreen

    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert(
        'Falha ao Salvar',
        error.response?.data?.error || 'Não foi possível registar a compra.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderização ---

  // Mostra loading enquanto busca tratores
  if (isFetchingTratores) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
        <Text>Carregando máquinas...</Text>
      </View>
    );
  }

  // O formulário completo
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
          onValueChange={(itemValue) =>
            // Esta é a correção que fizemos antes
            setFormData((prev) => ({ ...prev, tratorId: itemValue }))
          }
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

      {/* Bloco de Upload de Imagem */}
      <Text style={styles.label}>Nota Fiscal (Opcional)</Text>
      <View style={styles.imagePickerContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={() => handlePickImage('gallery')}>
          <Text style={styles.imageButtonText}>Escolher da Galeria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageButton} onPress={() => handlePickImage('camera')}>
          <Text style={styles.imageButtonText}>Tirar Foto</Text>
        </TouchableOpacity>
      </View>

      {/* Preview da Imagem */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
          <Button title="Remover Imagem" onPress={() => setSelectedImage(null)} color="red" />
        </View>
      )}

      {/* Botão de Salvar */}
      <View style={styles.buttonSpacer} />
      <Button
        title={isLoading ? 'Salvando...' : 'Salvar Compra'}
        onPress={handleSubmit}
        disabled={isLoading}
      />
      
      {/* Espaço no final para rolar */}
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
    marginBottom: 15, // Adicionado para espaçamento
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center', // Adicionado
    flex: 1, // Adicionado
    marginHorizontal: 5, // Adicionado
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1, // Adicionado
    borderColor: '#ddd', // Adicionado
  },
  buttonSpacer: {
    marginTop: 20,
  },
});