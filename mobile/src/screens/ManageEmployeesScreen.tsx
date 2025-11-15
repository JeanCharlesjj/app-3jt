import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Button,} from 'react-native';
import api from '../services/api'; // Nosso 'api.ts'
import { AppScreenProps } from '../navigation/types'; // Nossos tipos
import { useIsFocused } from '@react-navigation/native'; // Para recarregar a lista

// 1. Define o tipo do Funcionário (User)
interface Employee {
  _id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
}

// 2. Define as props da tela (para navegação)
type Props = AppScreenProps<'ManageEmployees'>;

export default function ManageEmployeesScreen({ navigation }: Props) {
  const isFocused = useIsFocused(); // Hook (true se a tela está visível)

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Função para buscar os funcionários no backend
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      // Usamos a nova rota que só o gerente pode acessar
      const response = await api.get('/users/employees');
      setEmployees(response.data);
    } catch (error: any) {
      console.error(error.response?.data);
      Alert.alert('Erro', 'Não foi possível carregar os funcionários.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 4. Efeito que roda quando a tela fica visível
  useEffect(() => {
    if (isFocused) {
      fetchEmployees();
    }
  }, [isFocused, fetchEmployees]);

  // 5. Função para DESABILITAR um funcionário (Soft Delete)
  const handleDisable = (employeeId: string, employeeName: string) => {
    Alert.alert(
      'Confirmar Desativação',
      `Tem a certeza que quer desabilitar "${employeeName}"?\n\nO usuário não poderá mais aceder ao aplicativo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desabilitar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Chama a API de delete (que faz o soft delete)
              await api.delete(`/users/${employeeId}`);
              Alert.alert('Sucesso!', 'Funcionário desabilitado.');
              // Recarrega a lista
              fetchEmployees();
            } catch (error: any) {
              console.error(error.response?.data);
              Alert.alert('Erro', 'Não foi possível desabilitar o funcionário.');
            }
          },
        },
      ]
    );
  };

  // 6. Função para EDITAR (por agora, só navega)
  const handleEdit = (employeeId: string) => {
    // TODO: Criar a tela 'EditEmployeeScreen'
    Alert.alert('Em breve', 'A tela de edição de funcionário será implementada aqui.');
    // navigation.navigate('EditEmployee', { employeeId: employeeId });
  };

  // 7. O que renderiza cada item da lista
  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{item.email}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => handleEdit(item._id)} style={[styles.button, styles.editButton]}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDisable(item._id, item.name)} style={[styles.button, styles.deleteButton]}>
          <Text style={styles.buttonText}>Desabilitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botão para Adicionar Novo Funcionário */}
      <View style={styles.addButtonContainer}>
        <Button
          title="Adicionar Novo Funcionário"
          onPress={() => navigation.navigate('RegisterEmployee')}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={employees}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum funcionário cadastrado.</Text>
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
  addButtonContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  loader: {
    marginTop: 50,
  },
  list: {
    flex: 1, // Garante que a lista ocupe o espaço
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
    flex: 1,
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
    flexDirection: 'column',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 4,
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