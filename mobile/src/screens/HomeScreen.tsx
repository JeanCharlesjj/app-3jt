import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // Hook de autenticação
import api from '../services/api'; // Nosso 'api.ts'
import { AppScreenProps } from '../navigation/RootNavigator'; // O tipo que criamos
import { useIsFocused } from '@react-navigation/native'; // Hook para "recarregar"

// 1. Define o tipo de dados da Compra (baseado no nosso backend)
interface Compra {
  _id: string;
  description: string;
  value: number;
  purchaseDate: string; // A data virá como string
  category: string;
  user: { _id: string; name: string };
  trator: { _id: string; name: string; plate: string };
}

// 2. Define as props da tela (para navegação)
type Props = AppScreenProps<'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth(); // Pega o usuário e a função de logout
  const isFocused = useIsFocused(); // Hook (true se a tela está visível)

  const [purchases, setPurchases] = useState<Compra[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Função para buscar os dados no backend
  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      // A MÁGICA: O token já está no 'api' graças ao AuthContext
      const response = await api.get('/compras');
      setPurchases(response.data);
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as compras.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback para otimização

  // 4. Efeito que roda quando a tela fica visível
  useEffect(() => {
    if (isFocused) {
      fetchPurchases();
    }
  }, [isFocused, fetchPurchases]); // Roda de novo se 'isFocused' mudar

  // 5. O que renderiza cada item da lista
  const renderItem = ({ item }: { item: Compra }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.description}</Text>
      <Text style={styles.itemValue}>
        R$ {item.value.toFixed(2).replace('.', ',')}
      </Text>
      <Text style={styles.itemSubtitle}>
        Máquina: {item.trator.name} ({item.trator.plate})
      </Text>
      {/* A lógica do backend já filtra, mas podemos mostrar quem registrou */}
      <Text style={styles.itemSubtitle}>
        Registrado por: {item.user.name}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Olá, {user?.name}</Text>
        <Button title="Sair" onPress={signOut} color="#ff4d4d" />
      </View>

      <Button
        title="Cadastrar Nova Compra"
        onPress={() => navigation.navigate('RegisterPurchase')} // 6. Botão de Navegação
      />

      {/* 7. Lógica de Loading e FlatList */}
      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={purchases}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma compra registrada.</Text>
          }
        />
      )}
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  list: {
    marginTop: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemValue: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});