import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator, Badge, Button, List, Divider, FAB } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { tarefaServico } from '../services/tarefaServico';
import { utilizadorServico } from '../services/utilizadorServico';

export default function DashboardScreen({ navigation }) {
  const { utilizador } = useAuth();
  const [dadosDashboard, setDadosDashboard] = useState(null);
  const [estaAObterDados, setEstaAObterDados] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    obterDados();

    // Actualizar ao voltar ao ecrã
    const unsubscribe = navigation.addListener('focus', () => {
      obterDados();
    });

    return unsubscribe;
  }, [navigation]);

  const obterDados = async () => {
    try {
      setEstaAObterDados(true);
      setErro('');
      
      let dados = {};

      try {
        // Para admin, apenas procuramos utilizadores e não tarefas
        if (utilizador.funcao === 'admin') {
          const utilizadores = await utilizadorServico.procurarTodosOsUtilizadores();
          dados = { utilizadores };
        }
        // Para outros papéis, obtemos as tarefas normalmente
        else {
          const tarefas = await tarefaServico.procurarTodasAsTarefas();
          dados = { tarefas };
          
          // Para líderes de equipa, também obtemos os utilizadores
          if (utilizador.funcao === 'lider_equipa') {
            const utilizadores = await utilizadorServico.procurarTodosOsUtilizadores();
            dados.utilizadores = utilizadores;
          }
        }
      } catch (apiError) {
        // Log the actual API error for debugging
        console.error('API Error:', apiError);
        
        // Handle specific error cases
        if (apiError.mensagemAPI && apiError.mensagemAPI.includes('Acesso proibido')) {
          console.warn('Permission error detected, handling gracefully');
          
          // For admin users, still try to get user data even if task data fails
          if (utilizador.funcao === 'admin') {
            const utilizadores = await utilizadorServico.procurarTodosOsUtilizadores();
            dados = { utilizadores };
          } else {
            throw apiError; // Re-throw if not an admin
          }
        } else {
          throw apiError; // Re-throw other errors
        }
      }

      setDadosDashboard(dados);
    } catch (erro) {
      setErro(erro.mensagemAPI || 'Não foi possível obter os dados.');
    } finally {
      setEstaAObterDados(false);
    }
  };

  const navegarParaTarefas = () => {
    navigation.navigate('TarefasTab', { screen: 'ListaTarefas' });
  };

  const DashboardProgramador = ({ tarefas }) => {
    // Debug for tasks
    console.log('Tarefas no dashboard:', tarefas.length);
    console.log('Utilizador atual:', utilizador.nome_utilizador, utilizador.utilizador_id);
    
    const minhasTarefas = useMemo(() =>
      tarefas.filter(t => (
        // Match by name or ID
        (t.utilizador_atribuido_nome === utilizador.nome_utilizador ||
         t.utilizador_atribuido_id === utilizador.utilizador_id) &&
        // Only show active tasks
        (t.estado === 'atribuida' || t.estado === 'em_progresso')
      ))
        .sort((a, b) => {
          if (a.estado === 'em_progresso' && b.estado !== 'em_progresso') return -1;
          if (a.estado !== 'em_progresso' && b.estado === 'em_progresso') return 1;
          return 0;
        }),
      [tarefas]
    );

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Minhas Tarefas Ativas</Title>
          <Divider style={styles.divider} />
          {minhasTarefas.length === 0 ? (
            <Paragraph>Não tem tarefas ativas de momento. Bom trabalho!</Paragraph>
          ) : (
            <>
              {minhasTarefas.slice(0, 5).map(tarefa => (
                <List.Item
                  key={tarefa.id}
                  title={`Tarefa #${tarefa.id}`}
                  description={tarefa.descricao}
                  right={() => (
                    <Badge
                      style={[
                        styles.badge,
                        { backgroundColor: tarefa.estado === 'em_progresso' ? '#2196F3' : '#03A9F4' }
                      ]}
                    >
                      {tarefa.estado === 'em_progresso' ? 'Em Progresso' : 'Atribuída'}
                    </Badge>
                  )}
                  onPress={navegarParaTarefas}
                />
              ))}
              {minhasTarefas.length > 5 && (
                <Button
                  mode="outlined"
                  onPress={navegarParaTarefas}
                  style={styles.verMaisButton}
                >
                  Ver Todas as Minhas Tarefas ({minhasTarefas.length})
                </Button>
              )}
            </>
          )}
        </Card.Content>
      </Card>
    );
  };

  const DashboardLiderEquipa = ({ tarefas, utilizadores }) => {
    const tarefasNaoAtribuidas = useMemo(() => 
      tarefas.filter(t => t.estado === 'nao_atribuida'),
      [tarefas]
    );
    const programadores = useMemo(() => 
      utilizadores?.filter(u => u.funcao === 'programador') || [],
      [utilizadores]
    );

    return (
      <>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Tarefas por Atribuir</Title>
            <View style={styles.statsContainer}>
              <Text style={styles.statsNumber}>{tarefasNaoAtribuidas.length}</Text>
              <Text>Tarefa(s) não atribuída(s)</Text>
              <Button
                mode="contained"
                onPress={navegarParaTarefas}
                style={styles.actionButton}
              >
                Gerir Tarefas
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Equipa</Title>
            <View style={styles.statsContainer}>
              <Text style={styles.statsNumber}>{programadores.length}</Text>
              <Text>Programador(es) na equipa</Text>
            </View>
          </Card.Content>
        </Card>
      </>
    );
  };

  const DashboardGerente = ({ tarefas }) => {
    const minhasTarefasCriadas = useMemo(() => {
      return tarefas.filter(t => Number(t.criado_por) === Number(utilizador.utilizador_id));
    }, [tarefas, utilizador.utilizador_id]);

    const estatisticas = {
      total: minhasTarefasCriadas.length,
      naoAtribuidas: minhasTarefasCriadas.filter(t => t.estado === 'nao_atribuida').length,
      atribuidas: minhasTarefasCriadas.filter(t => t.estado === 'atribuida').length,
      emProgresso: minhasTarefasCriadas.filter(t => t.estado === 'em_progresso').length,
      concluidas: minhasTarefasCriadas.filter(t => t.estado === 'concluida').length
    };

    const navegarParaCriarTarefa = () => {
      navigation.navigate('TarefasTab', { screen: 'CriarTarefa' });
    };

    return (
      <View style={styles.containerWithFAB}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Resumo das Minhas Tarefas Criadas</Title>
            <Divider style={styles.divider} />
            
            <List.Item
              title="Total Criadas"
              right={() => <Badge style={styles.badgeDark}>{estatisticas.total}</Badge>}
            />
            <List.Item
              title="Não Atribuídas"
              right={() => <Badge style={styles.badgeGray}>{estatisticas.naoAtribuidas}</Badge>}
            />
            <List.Item
              title="A Aguardar Início"
              right={() => <Badge style={styles.badgeInfo}>{estatisticas.atribuidas}</Badge>}
            />
            <List.Item
              title="Em Progresso"
              right={() => <Badge style={styles.badgePrimary}>{estatisticas.emProgresso}</Badge>}
            />
            <List.Item
              title="Concluídas"
              right={() => <Badge style={styles.badgeSuccess}>{estatisticas.concluidas}</Badge>}
            />

            <Button
              mode="contained"
              onPress={navegarParaTarefas}
              style={styles.actionButton}
            >
              Gerir Todas as Minhas Tarefas
            </Button>
          </Card.Content>
        </Card>

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={navegarParaCriarTarefa}
          label="Nova Tarefa"
        />
      </View>
    );
  };

  const DashboardAdmin = ({ utilizadores }) => {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Utilizadores</Title>
            <View style={styles.statsContainer}>
              <Text style={styles.statsNumber}>{utilizadores?.length || 0}</Text>
              <Text>Utilizador(es) no sistema</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('UtilizadoresTab')}
                style={styles.actionButton}
                icon="account-multiple-check"
              >
                Gerir Utilizadores
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  if (estaAObterDados) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>A obter dados do painel...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{erro}</Text>
        <Button mode="contained" onPress={obterDados}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.welcomeTitle}>
        Bem-vindo(a), {utilizador.nome_utilizador}!
      </Title>

      {dadosDashboard && (
        <>
          {utilizador.funcao === 'programador' && dadosDashboard.tarefas && (
            <DashboardProgramador tarefas={dadosDashboard.tarefas} />
          )}
          {utilizador.funcao === 'lider_equipa' && dadosDashboard.tarefas && (
            <DashboardLiderEquipa
              tarefas={dadosDashboard.tarefas}
              utilizadores={dadosDashboard.utilizadores}
            />
          )}
          {utilizador.funcao === 'gerente' && dadosDashboard.tarefas && (
            <DashboardGerente tarefas={dadosDashboard.tarefas} />
          )}
          {utilizador.funcao === 'admin' && dadosDashboard.utilizadores && (
            <DashboardAdmin utilizadores={dadosDashboard.utilizadores} />
          )}
        </>
      )}
    </ScrollView>
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
  welcomeTitle: {
    fontSize: 24,
    padding: 16,
    color: '#2196F3',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  divider: {
    marginVertical: 12,
  },
  statsContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2196F3',
  },
  actionButton: {
    marginTop: 16,
  },
  badge: {
    alignSelf: 'center',
  },
  badgeDark: {
    backgroundColor: '#333',
  },
  badgeGray: {
    backgroundColor: '#757575',
  },
  badgeInfo: {
    backgroundColor: '#03A9F4',
  },
  badgePrimary: {
    backgroundColor: '#2196F3',
  },
  badgeSuccess: {
    backgroundColor: '#4CAF50',
  },
  verMaisButton: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 22,
  },
  containerWithFAB: {
    position: 'relative',
    flex: 1,
    paddingBottom: 100, // Increased padding to prevent FAB overlapping
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16, // Position relative to the container's padding
    margin: 0,
    backgroundColor: '#2196F3',
    zIndex: 1,
  },
});