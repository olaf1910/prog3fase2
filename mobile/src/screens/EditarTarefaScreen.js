import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Title, TextInput, Button, Snackbar, Dialog, Portal, Text } from 'react-native-paper';
import { tarefaServico } from '../services/tarefaServico';
import { useAuth } from '../contexts/AuthContext';

export default function EditarTarefaScreen({ route, navigation }) {
  const { tarefa } = route.params;
  const { utilizador } = useAuth();
  const [descricao, setDescricao] = useState(tarefa.descricao);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [estaAGuardar, setEstaAGuardar] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  // Verifica permissões
  useEffect(() => {
    if (utilizador.funcao !== 'gerente') {
      setMensagem('Apenas gerentes podem gerir tarefas.');
      setErro(true);
      setTimeout(() => navigation.goBack(), 1500);
    }
  }, [utilizador, navigation]);

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

  const handleAtualizarDescricao = async () => {
    if (!descricao.trim()) {
      setMensagem('A descrição é obrigatória');
      setErro(true);
      return;
    }

    try {
      setEstaAGuardar(true);
      await tarefaServico.atualizarTarefa(tarefa.id, { descricao });
      setMensagem('Descrição actualizada com sucesso!');
      setErro(false);
      
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      setMensagem(error.mensagemAPI || 'Não foi possível actualizar a descrição.');
      setErro(true);
    } finally {
      setEstaAGuardar(false);
    }
  };

  const handleEliminarTarefa = async () => {
    try {
      setEstaAGuardar(true);
      await tarefaServico.eliminarTarefa(tarefa.id);
      setMensagem('Tarefa eliminada com sucesso!');
      setErro(false);
      setDialogoEliminar(false);
      
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      setMensagem(error.mensagemAPI || 'Não foi possível eliminar a tarefa.');
      setErro(true);
    } finally {
      setEstaAGuardar(false);
    }
  };

  if (utilizador.funcao !== 'gerente') {
    return null;
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Gerir Tarefa</Title>
            
            <Text style={styles.taskInfo}>
              Estado Actual: {getStatusText(tarefa.estado)}
            </Text>
            {tarefa.atribuido_a && (
              <Text style={styles.taskInfo}>
                Atribuído a: {tarefa.atribuido_a}
              </Text>
            )}
            
            <TextInput
              label="Descrição da Tarefa"
              value={descricao}
              onChangeText={setDescricao}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              error={erro && !descricao.trim()}
              disabled={estaAGuardar}
            />

            <Button
              mode="contained"
              onPress={handleAtualizarDescricao}
              loading={estaAGuardar}
              disabled={estaAGuardar}
              style={[styles.button, styles.updateButton]}
            >
              Actualizar Descrição
            </Button>

            <Button
              mode="contained"
              onPress={() => setDialogoEliminar(true)}
              disabled={estaAGuardar}
              style={[styles.button, styles.deleteButton, styles.marginTop]}
            >
              Eliminar Tarefa
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={dialogoEliminar} onDismiss={() => setDialogoEliminar(false)}>
          <Dialog.Title>Eliminar Tarefa</Dialog.Title>
          <Dialog.Content>
            <Title>Tem a certeza que pretende eliminar esta tarefa?</Title>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogoEliminar(false)}>Cancelar</Button>
            <Button 
              onPress={handleEliminarTarefa}
              textColor="#D32F2F"
            >
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  taskInfo: {
    fontSize: 16,
    marginBottom: 12,
    color: '#666',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
  },
  marginTop: {
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
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