import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import {
  ActivityIndicator,
  Text,
  FAB,
  Searchbar,
  Card,
  Title,
  Paragraph,
  Button,
  Portal,
  Dialog,
  Snackbar,
  IconButton
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { utilizadorServico } from '../services/utilizadorServico';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';

const GerirUtilizadoresScreen = ({ navigation }) => {
  const { utilizador } = useAuth();
  const [utilizadores, setUtilizadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [utilizadoresFiltrados, setUtilizadoresFiltrados] = useState([]);
  
  // Modal states
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [visibleDeleteModal, setVisibleDeleteModal] = useState(false);
  const [utilizadorSelecionado, setUtilizadorSelecionado] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [aEliminar, setAEliminar] = useState(false);

  // Load users on component mount
  const carregarUtilizadores = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const data = await utilizadorServico.procurarTodosOsUtilizadores();
      setUtilizadores(data);
      setUtilizadoresFiltrados(data);
    } catch (error) {
      setErro(error.mensagemAPI || 'Não foi possível carregar utilizadores');
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, []);

  // Access control check
  useEffect(() => {
    if (utilizador?.funcao !== 'admin') {
      navigation.goBack();
      return;
    }
    
    carregarUtilizadores();
  }, [utilizador, navigation, carregarUtilizadores]);

  // Search functionality
  useEffect(() => {
    if (pesquisa) {
      const filtered = utilizadores.filter(item => 
        item.nome_utilizador.toLowerCase().includes(pesquisa.toLowerCase()) || 
        item.email.toLowerCase().includes(pesquisa.toLowerCase())
      );
      setUtilizadoresFiltrados(filtered);
    } else {
      setUtilizadoresFiltrados(utilizadores);
    }
  }, [pesquisa, utilizadores]);

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!utilizadorSelecionado) return;
    
    setAEliminar(true);
    try {
      await utilizadorServico.eliminarUtilizador(utilizadorSelecionado.id);
      setSnackbarMessage('Utilizador eliminado com sucesso');
      setSnackbarVisible(true);
      await carregarUtilizadores();
    } catch (error) {
      setErro(error.mensagemAPI || 'Não foi possível eliminar o utilizador');
    } finally {
      setAEliminar(false);
      setVisibleDeleteModal(false);
    }
  };

  // Render user item
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.nome_utilizador}</Title>
          <Text>ID: {item.id}</Text>
        </View>
        <Paragraph>{item.email}</Paragraph>
        <View style={styles.cardDetails}>
          <View style={[
            styles.badge, 
            { backgroundColor: 
              item.funcao === 'admin' ? '#f44336' : 
              item.funcao === 'gerente' ? '#ff9800' : 
              item.funcao === 'lider_equipa' ? '#2196f3' : 
              '#9e9e9e' 
            }
          ]}>
            <Text style={styles.badgeText}>{item.funcao}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Criado em:</Text>
            <Text style={styles.date}>
              {new Date(item.criado_em).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button 
          icon="pencil"
          mode="text"
          onPress={() => {
            setUtilizadorSelecionado(item);
            setVisibleEditModal(true);
          }}
        >
          Editar
        </Button>
        <Button 
          icon="delete"
          mode="text"
          onPress={() => {
            setUtilizadorSelecionado(item);
            setVisibleDeleteModal(true);
          }}
        >
          Eliminar
        </Button>
      </Card.Actions>
    </Card>
  );

  if (carregando && !refreshing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>A carregar utilizadores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Procurar utilizadores..."
        onChangeText={setPesquisa}
        value={pesquisa}
        style={styles.searchbar}
      />
      
      {erro ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{erro}</Text>
          <Button mode="contained" onPress={carregarUtilizadores} style={styles.retryButton}>
            Tentar novamente
          </Button>
        </View>
      ) : null}
      
      <FlatList
        data={utilizadoresFiltrados}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              carregarUtilizadores();
            }}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum utilizador encontrado</Text>
            {utilizadores.length > 0 && (
              <Text style={styles.emptySubText}>Tente ajustar sua pesquisa</Text>
            )}
          </View>
        )}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setVisibleAddModal(true)}
        label="Adicionar"
        color="white"
      />
      
      {/* Delete Confirmation Modal */}
      <Portal>
        <Dialog
          visible={visibleDeleteModal}
          onDismiss={() => !aEliminar && setVisibleDeleteModal(false)}
        >
          <Dialog.Title>Confirmar Eliminação</Dialog.Title>
          <Dialog.Content>
            {utilizadorSelecionado && (
              <>
                <Text>
                  Tem a certeza que deseja eliminar o utilizador 
                  <Text style={styles.boldText}> {utilizadorSelecionado.nome_utilizador} </Text>
                  (ID: {utilizadorSelecionado.id})?
                </Text>
                <Text style={styles.warningText}>
                  Esta ação não pode ser revertida.
                </Text>
                <Card style={styles.warningCard}>
                  <Card.Content>
                    <Text>
                      ⚠️ Nota: Se este utilizador tiver tarefas associadas ou outras
                      dependências, a eliminação poderá falhar.
                    </Text>
                  </Card.Content>
                </Card>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisibleDeleteModal(false)} disabled={aEliminar}>Cancelar</Button>
            <Button 
              onPress={handleDeleteUser} 
              mode="contained" 
              loading={aEliminar}
              disabled={aEliminar}
              style={{backgroundColor: aEliminar ? '#ccc' : '#f44336'}}
            >
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Add User Modal */}
      {visibleAddModal && (
        <AddUserModal
          visible={visibleAddModal}
          onDismiss={() => setVisibleAddModal(false)}
          onSuccess={() => {
            setSnackbarMessage('Utilizador criado com sucesso');
            setSnackbarVisible(true);
            carregarUtilizadores();
          }}
        />
      )}
      
      {/* Edit User Modal */}
      {visibleEditModal && utilizadorSelecionado && (
        <EditUserModal
          visible={visibleEditModal}
          onDismiss={() => setVisibleEditModal(false)}
          utilizador={utilizadorSelecionado}
          onSuccess={() => {
            setSnackbarMessage('Utilizador atualizado com sucesso');
            setSnackbarVisible(true);
            carregarUtilizadores();
          }}
        />
      )}
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#757575',
    marginRight: 4,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#757575',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  error: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  warningCard: {
    marginTop: 16,
    backgroundColor: '#FFF9C4',
  },
  warningText: {
    marginVertical: 8,
    fontStyle: 'italic',
    color: '#F57C00',
  },
  boldText: {
    fontWeight: 'bold',
  }
});

export default GerirUtilizadoresScreen;