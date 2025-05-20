import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Card, Title, Text, Button, Divider, TextInput, ActivityIndicator, Chip, List, IconButton } from 'react-native-paper';
import { utilizadorServico } from '../services/utilizadorServico';
import { useAuth } from '../contexts/AuthContext';

export default function PerfilScreen({ navigation }) {
  const { utilizador, terminarSessao } = useAuth();
  const [estaAFinalizarSessao, setEstaAFinalizarSessao] = useState(false);
  
  // Estado para competências
  const [competencias, setCompetencias] = useState([]);
  const [novaCompetencia, setNovaCompetencia] = useState('');
  const [estaACarregarCompetencias, setEstaACarregarCompetencias] = useState(false);
  const [estaAAdicionarCompetencia, setEstaAAdicionarCompetencia] = useState(false);
  const [erro, setErro] = useState('');

  // Obter competências se for programador
  useEffect(() => {
    if (utilizador && utilizador.funcao === 'programador') {
      obterCompetencias();
    }
  }, [utilizador]);

  // Função para obter competências
  const obterCompetencias = async () => {
    if (!utilizador) return;
    
    try {
      setEstaACarregarCompetencias(true);
      setErro('');
      const competenciasObtidas = await utilizadorServico.obterCompetenciasUtilizador(utilizador.utilizador_id);
      setCompetencias(competenciasObtidas);
    } catch (error) {
      setErro('Não foi possível obter as competências.');
      console.error('Erro ao obter competências:', error);
    } finally {
      setEstaACarregarCompetencias(false);
    }
  };

  // Função para adicionar competência
  const adicionarCompetencia = async () => {
    if (!novaCompetencia.trim()) {
      setErro('Por favor, introduza uma competência válida.');
      return;
    }
    
    try {
      setEstaAAdicionarCompetencia(true);
      setErro('');
      const competenciasAtualizadas = await utilizadorServico.adicionarCompetencia(
        utilizador.utilizador_id,
        novaCompetencia.trim()
      );
      setCompetencias(competenciasAtualizadas);
      setNovaCompetencia('');
    } catch (error) {
      setErro(error.mensagemAPI || 'Não foi possível adicionar a competência.');
    } finally {
      setEstaAAdicionarCompetencia(false);
    }
  };

  const handleLogout = async () => {
    try {
      setEstaAFinalizarSessao(true);
      await terminarSessao();
    } catch (erro) {
      console.error('Não foi possível terminar a sessão:', erro);
    } finally {
      setEstaAFinalizarSessao(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          <Title style={styles.title}>Dados do Utilizador</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Nome de Utilizador</Text>
            <Text style={styles.value}>
              {utilizador?.nome_utilizador || 'N/A'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Função</Text>
            <Text style={styles.value}>
              {utilizador?.funcao || 'N/A'}
            </Text>
          </View>

          {utilizador?.email && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{utilizador.email}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Secção de Competências - Apenas para Programadores */}
      {utilizador && utilizador.funcao === 'programador' && (
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <Title style={styles.title}>Minhas Competências</Title>
            <Divider style={styles.divider} />

            {estaACarregarCompetencias ? (
              <View style={styles.centeredContent}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.loadingText}>A carregar competências...</Text>
              </View>
            ) : erro ? (
              <Text style={styles.errorText}>{erro}</Text>
            ) : (
              <>
                {competencias.length === 0 ? (
                  <Text style={styles.infoText}>Ainda não adicionou nenhuma competência.</Text>
                ) : (
                  <View style={styles.competenciasContainer}>
                    {competencias.map(comp => (
                      <Chip
                        key={comp.id}
                        style={styles.competenciaChip}
                        mode="outlined"
                        icon="star"
                      >
                        {comp.nome}
                      </Chip>
                    ))}
                  </View>
                )}

                <View style={styles.addCompetenciaContainer}>
                  <TextInput
                    label="Nova competência"
                    value={novaCompetencia}
                    onChangeText={text => setNovaCompetencia(text)}
                    style={styles.competenciaInput}
                    disabled={estaAAdicionarCompetencia}
                    placeholder="Ex: React Native, Node.js, SQL"
                  />
                  <Button
                    mode="contained"
                    onPress={adicionarCompetencia}
                    loading={estaAAdicionarCompetencia}
                    disabled={estaAAdicionarCompetencia || !novaCompetencia.trim()}
                    style={styles.addButton}
                    icon="plus"
                  >
                    Adicionar
                  </Button>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Admin user management button removed as it's now in the tab navigation */}

      <Button
        mode="contained"
        onPress={() => navigation.navigate('AlterarPalavraPasse')}
        style={styles.alterarPalavraPasseButton}
        icon="key"
      >
        Alterar Palavra-passe
      </Button>

      <Button
        mode="contained"
        onPress={handleLogout}
        loading={estaAFinalizarSessao}
        disabled={estaAFinalizarSessao}
        style={styles.logoutButton}
        contentStyle={styles.buttonContent}
        icon="logout"
      >
        {estaAFinalizarSessao ? 'A finalizar a sessão...' : 'Terminar Sessão'}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#2196F3',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e0e0e0',
    height: 1,
  },
  infoContainer: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  // Estilos para secção de competências
  competenciasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  competenciaChip: {
    margin: 4,
    backgroundColor: '#E3F2FD',
  },
  addCompetenciaContainer: {
    marginTop: 8,
  },
  competenciaInput: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  centeredContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  errorText: {
    color: '#D32F2F',
    marginVertical: 8,
  },
  infoText: {
    color: '#757575',
    fontStyle: 'italic',
    marginVertical: 16,
    textAlign: 'center',
  },
  alterarPalavraPasseButton: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#2196F3',
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: '#f44336',
  },
  buttonContent: {
    height: 48,
  },
});