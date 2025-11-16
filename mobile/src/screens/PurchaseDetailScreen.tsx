import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,ScrollView,ActivityIndicator,Alert,Image,} from 'react-native';
import api from '../services/api'; // O nosso 'api.ts'
import { AppScreenProps } from '../navigation/types'; // Os nossos tipos
import { API_URL } from '@env'; // A TUA URL DO BACKEND!

// Define as props da tela
type Props = AppScreenProps<'PurchaseDetail'>;

// Interface para os dados completos da compra
interface PurchaseDetails {
  _id: string;
  description: string;
  value: number;
  purchaseDate: string;
  category: string;
  paymentMethod: string;
  receiptImageUrl?: string; // A imagem é opcional
  user: { _id: string; name: string };
  trator: { _id: string; name: string; plate: string; modelName?: string };
}

// Função para formatar a data (opcional, mas fica melhor)
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return 'Data inválida';
  }
};

export default function PurchaseDetailScreen({ navigation, route }: Props) {
  // 1. Pega o ID que a HomeScreen enviou
  const { purchaseId } = route.params;

  const [compra, setCompra] = useState<PurchaseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Efeito que busca os dados no backend
  useEffect(() => {
    async function fetchPurchaseDetails() {
      try {
        // Chama a nova rota que criámos no backend
        const response = await api.get(`/compras/${purchaseId}`);
        setCompra(response.data);
      } catch (error: any) {
        console.error(error.response?.data);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPurchaseDetails();
  }, [purchaseId, navigation]);

  // 3. Renderização do Loading
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 4. Renderização dos Detalhes
  if (!compra) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Compra não encontrada.</Text>
      </View>
    );
  }

  // Constrói a URL da imagem
  const imageUrl = compra.receiptImageUrl
    ? `${API_URL}/files/${compra.receiptImageUrl}`
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* Secção da Imagem */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>Sem nota fiscal</Text>
        </View>
      )}

      {/* Secção de Detalhes */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{compra.description}</Text>

        <Text style={styles.value}>
          R$ {compra.value.toFixed(2).replace('.', ',')}
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Data da Compra:</Text>
          <Text style={styles.info}>{formatDate(compra.purchaseDate)}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Registado por:</Text>
          <Text style={styles.info}>{compra.user.name}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Máquina:</Text>
          <Text style={styles.info}>{compra.trator.name} ({compra.trator.plate})</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Categoria:</Text>
          <Text style={styles.info}>{compra.category}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Pagamento:</Text>
          <Text style={styles.info}>{compra.paymentMethod}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  noImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 18,
    color: '#555',
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  info: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
  },
});