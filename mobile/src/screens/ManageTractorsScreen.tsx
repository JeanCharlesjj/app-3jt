import React, { useState, useEffect, useCallback } from 'react';
import {View,Text,StyleSheet,FlatList,Button,ActivityIndicator,Alert,TouchableOpacity } from 'react-native';
import api from '../services/api'; // O nosso 'api.ts'
import { AppScreenProps } from '../navigation/RootNavigator'; // Props de navegação
import { useIsFocused } from '@react-navigation/native'; // Para recarregar a lista

// 1. Define o tipo do Trator
interface Trator {
  _id: string;
  name: string;
  modelName?: string;
  plate?: string;
}

// 2. Define as props da tela (para navegação)
type Props = AppScreenProps<'ManageTractors'>;

export default function ManageTractorsScreen({ navigation }: Props) {
  const isFocused = useIsFocused(); // Hook (true se a tela está visível)

  const [tratores, setTratores] = useState<Trator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Função para buscar os tratores no backend
  const fetchTratores = useCallback(async () => {
    setIsLoading(true);
    try {
      // O token de gerente já está a ser enviado pelo AuthContext
      const response = await api.get('/tratores');
      setTratores(response.data);
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert('Erro', 'Não foi possível carregar as máquinas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 4. Efeito que roda quando a tela fica visível
  useEffect(() => {
    if (isFocused) {
      fetchTratores();
    }
  }, [isFocused, fetchTratores]);

  // 5. Função para EXCLUIR um trator
  const handleDelete = (tratorId: string, tratorName: string) => {
    // Alerta de confirmação
    Alert.alert(
      'Confirmar Exclusão',
      `Tem a certeza que quer excluir a máquina "${tratorName}"?\n\nEsta ação não pode ser desfeita.`,
      [
        // Botão "Cancelar"
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        // Botão "Excluir"
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Chama a API de delete
              await api.delete(`/tratores/${tratorId}`);
              Alert.alert('Sucesso!', 'Máquina excluída.');
              // Recarrega a lista
              fetchTratores();
            } catch (error: any) {
              console.error(error.response?.data);
              Alert.alert('Erro', 'Não foi possível excluir a máquina.');
            }
          },
        },
      ]
    );
  };

const handleEdit = (tratorId: string) => {
    // Remove o Alert e adiciona a navegação
    navigation.navigate('EditTractor', { tratorId: tratorId });
  };

  // 7. O que renderiza cada item da lista
  const renderItem = ({ item }: { item: Trator }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>
          Placa: {item.plate || 'N/A'}
        </Text>
        <Text style={styles.itemSubtitle}>
          Modelo: {item.modelName || 'N/A'}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => handleEdit(item._id)} style={[styles.button, styles.editButton]}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={[styles.button, styles.deleteButton]}>
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={tratores}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma máquina cadastrada.</Text>
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
    backgroundColor: '#f5f5f5',
  },
  loader: {
    marginTop: 50,
  },
  list: {
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1, // Ocupa o espaço disponível
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  itemActions: {
    flexDirection: 'column', // Empilha os botões
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 4, // Espaço entre os botões
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});