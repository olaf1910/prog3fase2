import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, SectionList, RefreshControl } from 'react-native';
import { Card, Title, Text, FAB, ActivityIndicator, Snackbar, Button, Divider } from 'react-native-paper';
import { tarefaServico } from '../services/tarefaServico';
import { useAuth } from '../contexts/AuthContext';

export default function TarefasScreen({ navigation }) {
  const { utilizador } = useAuth();
  const [tarefas, setTarefas] = useState([]);
  const [estaACarregar, setEstaACarregar] = useState(true);
  const [estaAAtualizar, setEstaAAtualizar] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'concluida':
        return '#4CAF50';
      case 'em_progresso':
        return '#FF9800';
      case 'atribuida':
        return '#2196F3';
      default: // nao_atribuida
        return '#757575';
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'nao_atribuida':
        return 'Não Atribuída';
      case 'atribuida':
        return 'Atribuída';
      case 'em_progresso':
        return 'Em Progresso';
      case 'concluida':
        return 'Concluída';
      default:
        return estado;
    }
  };

  const obterTarefas = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setEstaACarregar(true);
      }
      
      const tarefasCarregadas = await tarefaServico.procurarTodasAsTarefas();
      console.log('Tarefas obtidas (total):', tarefasCarregadas.length);
      // Não vamos definir tarefas diretamente aqui, será processado por useMemo
      setTarefas(tarefasCarregadas); // Manter para lógica existente, mas useMemo será a fonte da lista
      
      if (isRefreshing) {
        setMensagem('Lista de tarefas actualizada com sucesso!');
        setErro(false);
      }
    } catch (error) {
      console.error('Erro ao obter tarefas:', error);
      setMensagem(error.mensagemAPI || 'Não foi possível obter as tarefas.');
      setErro(true);
    } finally {
      setEstaACarregar(false);
      setEstaAAtualizar(false);
    }
  };

  // Processar e agrupar tarefas
  const seccoesDeTarefas = useMemo(() => {
    if (!tarefas || tarefas.length === 0) {
      return [];
    }

    const tarefasAgrupadas = tarefas.reduce((acc, tarefa) => {
      const estado = getStatusText(tarefa.estado);
      if (!acc[estado]) {
        acc[estado] = [];
      }
      acc[estado].push(tarefa);
      return acc;
    }, {});

    // Ordenar tarefas dentro de cada grupo (ex: por data de criação, mais recentes primeiro)
    Object.keys(tarefasAgrupadas).forEach(estado => {
      tarefasAgrupadas[estado].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
    });
    
    const ordemDosEstados = ['Não Atribuída', 'Em Progresso', 'Atribuída', 'Concluída'];

    return ordemDosEstados
      .map(tituloDaSeccao => ({
        title: tituloDaSeccao,
        data: tarefasAgrupadas[tituloDaSeccao] || [],
      }))
      .filter(seccao => seccao.data.length > 0); // Apenas mostrar secções com tarefas
  }, [tarefas]);

  useEffect(() => {
    obterTarefas();

    const unsubscribe = navigation.addListener('focus', () => {
      obterTarefas(); // Recarregar ao focar no ecrã
    });

    return unsubscribe;
  }, [navigation]);

  const handleIniciarTarefa = async (tarefa) => {
    try {
      // Passar a tarefa completa em vez de apenas o ID
      await tarefaServico.mudarEstadoTarefa(tarefa, 'em_progresso');
      setMensagem('Tarefa iniciada com sucesso!');
      setErro(false);
      await obterTarefas();
    } catch (error) {
      setMensagem(error.mensagemAPI || 'Não foi possível iniciar a tarefa.');
      setErro(true);
    }
  };

  const handleConcluirTarefa = async (tarefa) => {
    try {
      // Passar a tarefa completa em vez de apenas o ID
      await tarefaServico.mudarEstadoTarefa(tarefa, 'concluida');
      setMensagem('Tarefa concluída com sucesso!');
      setErro(false);
      await obterTarefas();
    } catch (error) {
      setMensagem(error.mensagemAPI || 'Não foi possível concluir a tarefa.');
      setErro(true);
    }
  };

  const formatarData = (dataString) => {
    try {
      // Assuming data_criacao is in format "YYYY-MM-DD HH:mm:ss"
      const data = new Date(dataString.replace(' ', 'T'));
      return data.toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar a data:', error);
      return dataString; // Return original string if parsing fails
    }
  };

  const renderBotoes = (tarefa) => {
    // Debug log para entender a estrutura das tarefas
    console.log('Tarefa:', {
      id: tarefa.id,
      estado: tarefa.estado,
      utilizador_atribuido_id: tarefa.utilizador_atribuido_id,
      utilizador_atribuido_nome: tarefa.utilizador_atribuido_nome,
      atribuido_a: tarefa.atribuido_a
    });
    console.log('Utilizador:', {
      id: utilizador.utilizador_id,
      nome: utilizador.nome_utilizador,
      funcao: utilizador.funcao
    });
    
    // Programador - pode iniciar ou concluir as suas tarefas atribuídas
    if (utilizador.funcao === 'programador' &&
        (tarefa.utilizador_atribuido_id === utilizador.utilizador_id ||
         tarefa.utilizador_atribuido_nome === utilizador.nome_utilizador)) {
      // Mostrar o botão "Iniciar Tarefa" para tarefas atribuídas
      if (tarefa.estado === 'atribuida') {
        return (
          <Button
            onPress={() => handleIniciarTarefa(tarefa)}
            mode="contained"
            buttonColor="#2196F3"
          >
            Iniciar Tarefa
          </Button>
        );
      }
      
      // Mostrar o botão "Concluir Tarefa" para tarefas em progresso
      if (tarefa.estado === 'em_progresso') {
        return (
          <Button
            onPress={() => handleConcluirTarefa(tarefa)}
            mode="contained"
            buttonColor="#4CAF50"
          >
            Concluir Tarefa
          </Button>
        );
      }
    }

    // Líder - pode atribuir tarefas não atribuídas
    if (utilizador.funcao === 'lider_equipa' && tarefa.estado === 'nao_atribuida') {
      return (
        <Button 
          onPress={() => {
            navigation.navigate('TarefasTab', { screen: 'AtribuirTarefa', params: { tarefa } });
          }}
          mode="text"
          textColor="#2196F3"
        >
          Atribuir Programador
        </Button>
      );
    }

    // Gerente - pode gerir qualquer tarefa
    if (utilizador.funcao === 'gerente') {
      return (
        <Button 
          onPress={() => navigation.navigate('TarefasTab', { screen: 'EditarTarefa', params: { tarefa } })}
          mode="text"
          textColor="#2196F3"
        >
          Gerir Tarefa
        </Button>
      );
    }

    return null;
  };

  const renderTarefaItem = ({ item, section }) => {
    const botoes = renderBotoes(item);
    const isNaoAtribuida = item.estado === 'nao_atribuida';

    return (
      <Card style={[
        styles.card,
        isNaoAtribuida && styles.naoAtribuidaCard // Estilo de destaque
      ]}>
        <Card.Content>
          <Title style={isNaoAtribuida && styles.naoAtribuidaTitle}>Tarefa #{item.id}</Title>
          <Text style={styles.descricao}>{item.descricao}</Text>
          <Text style={[styles.estado, { color: getStatusColor(item.estado) }]}>
            Estado: {getStatusText(item.estado)}
          </Text>
          {item.utilizador_atribuido_nome ? (
            <Text style={styles.detalhes}>
              Atribuído a: {item.utilizador_atribuido_nome}
            </Text>
          ) : (
             <Text style={[styles.detalhes, isNaoAtribuida && styles.naoAtribuidaTextDestaque]}>
              Sem utilizador atribuído
            </Text>
          )}
          <Text style={styles.detalhes}>
            Data de Criação: {new Date(item.criado_em).toLocaleString('pt-PT')}
          </Text>
        </Card.Content>
        {botoes && <Card.Actions style={styles.cardActions}>{botoes}</Card.Actions>}
      </Card>
    );
  };

  const renderHeaderSeccao = ({ section: { title } }) => (
    <View style={styles.seccaoHeaderContainer}>
      <Text style={styles.seccaoHeader}>{title}</Text>
      <Divider style={styles.seccaoDivider} />
    </View>
  );


  if (estaACarregar && !estaAAtualizar) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>A obter as tarefas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={seccoesDeTarefas}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderItem={renderTarefaItem}
        renderSectionHeader={renderHeaderSeccao}
        refreshControl={
          <RefreshControl
            refreshing={estaAAtualizar}
            onRefresh={() => {
              setEstaAAtualizar(true);
              obterTarefas(true); // Corrigido de carregarTarefas
            }}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          !estaACarregar && seccoesDeTarefas.length === 0 && (
            <Text style={styles.semTarefas}>
              Não foram encontradas tarefas.
            </Text>
          )
        }
        stickySectionHeadersEnabled={false} // Opcional: para cabeçalhos fixos
      />

      {utilizador.funcao === 'gerente' && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="Nova Tarefa"
          onPress={() => navigation.navigate('TarefasTab', { screen: 'CriarTarefa' })}
        />
      )}

      <Snackbar
        visible={!!mensagem}
        onDismiss={() => setMensagem('')}
        duration={3000}
        style={[
          styles.snackbar,
          erro ? styles.errorSnackbar : styles.successSnackbar
        ]}
      >
        {mensagem}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lista: {
    paddingHorizontal: 16, // Apenas padding horizontal para a lista geral
    paddingBottom: 80, // Para não sobrepor o FAB
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    marginHorizontal: 0, // Remover margem horizontal do card individual
  },
  naoAtribuidaCard: {
    backgroundColor: '#FFF9C4', // Amarelo claro para destaque
    borderColor: '#FFEB3B', // Borda amarela
    borderWidth: 1,
  },
  naoAtribuidaTitle: {
    color: '#C62828', // Cor de destaque para o título
  },
  naoAtribuidaTextDestaque: {
    fontWeight: 'bold',
    color: '#AD1457',
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  descricao: {
    marginVertical: 8,
    fontSize: 16,
  },
  estado: {
    marginTop: 8,
    fontWeight: '500',
    fontSize: 15,
  },
  detalhes: {
    marginTop: 4,
    color: '#666',
    fontSize: 14,
  },
  seccaoHeaderContainer: {
    backgroundColor: '#f5f5f5', // Para que o cabeçalho não seja transparente sobre os itens
    paddingTop: 16, // Espaço acima do título da secção
    paddingBottom: 8,
  },
  seccaoHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 8, // Alinhar com o conteúdo do card se necessário
  },
  seccaoDivider: {
    marginTop: 8,
    backgroundColor: '#e0e0e0',
  },
  semTarefas: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
    fontSize: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    margin: 0,
    backgroundColor: '#2196F3',
    elevation: 6,
    zIndex: 1,
  },
  snackbar: {
    margin: 16,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#D32F2F',
  },
});