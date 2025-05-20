import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, Snackbar } from 'react-native-paper';
import { tarefaServico } from '../services/tarefaServico';
import { utilizadorServico } from '../services/utilizadorServico';
import { useAuth } from '../contexts/AuthContext';

export default function AtribuirTarefaScreen({ route, navigation }) {
  const { tarefa } = route.params;
  const { utilizador } = useAuth();
  const [programadores, setProgramadores] = useState([]);
  const [estaAProcessar, setEstaAProcessar] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  // Verifica permissões e estado da tarefa
  useEffect(() => {
    console.log('A verificar permissões:', {
      funcao: utilizador.funcao,
      estadoTarefa: tarefa.estado
    });

    if (utilizador.funcao !== 'lider_equipa' || tarefa.estado !== 'nao_atribuida') {
      setMensagem('Sem permissão para atribuir esta tarefa.');
      setErro(true);
      setTimeout(() => navigation.goBack(), 1500);
    } else {
      obterProgramadores();
    }
  }, [utilizador, tarefa, navigation]);

  const obterProgramadores = async () => {
    try {
      const dados = await utilizadorServico.procurarTodosOsUtilizadores();
      const programadoresDisponiveis = dados.filter(user => user.funcao === 'programador');
      console.log('Programadores disponíveis:', programadoresDisponiveis);
      setProgramadores(programadoresDisponiveis);
    } catch (error) {
      console.error('Erro ao obter programadores:', error);
      setMensagem(error.mensagemAPI || 'Não foi possível obter a lista de programadores.');
      setErro(true);
    }
  };

  const handleAtribuirTarefa = async (programador) => {
    if (tarefa.estado !== 'nao_atribuida') {
      setMensagem('Esta tarefa não pode ser atribuída.');
      setErro(true);
      return;
    }

    try {
      setEstaAProcessar(true);
      await tarefaServico.atribuirTarefa(tarefa.id, programador);
      setMensagem('Tarefa atribuída com sucesso!');
      setErro(false);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      setMensagem(error.mensagemAPI || 'Erro ao atribuir tarefa.');
      setErro(true);
    } finally {
      setEstaAProcessar(false);
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

  if (utilizador.funcao !== 'lider_equipa' || tarefa.estado !== 'nao_atribuida') {
    return null;
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Atribuir Tarefa</Title>
            
            <Text style={styles.taskInfo}>
              Tarefa: {tarefa.descricao}
            </Text>
            <Text style={styles.taskInfo}>
              Estado actual: {getStatusText(tarefa.estado)}
            </Text>

            <Title style={styles.subtitle}>Seleccione um programador:</Title>

            {programadores.map((programador) => (
              <Button
                key={programador.id}
                mode="outlined"
                onPress={() => handleAtribuirTarefa(programador)}
                disabled={estaAProcessar}
                style={styles.programadorButton}
              >
                {programador.nome_utilizador}
              </Button>
            ))}

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Voltar
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 24,
    marginBottom: 16,
    color: '#666',
  },
  taskInfo: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  programadorButton: {
    marginVertical: 4,
  },
  cancelButton: {
    marginTop: 16,
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