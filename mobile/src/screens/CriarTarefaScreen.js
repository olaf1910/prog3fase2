import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Card, Title, TextInput, Button, Snackbar } from 'react-native-paper';
import { tarefaServico } from '../services/tarefaServico';
import { useAuth } from '../contexts/AuthContext';

export default function CriarTarefaScreen({ navigation }) {
  const { utilizador } = useAuth();
  const [descricao, setDescricao] = useState('');
  const [estaAGuardar, setEstaAGuardar] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  // Redireciona utilizadores sem permissão
  useEffect(() => {
    if (utilizador.funcao !== 'gerente') {
      navigation.replace('Tarefas');
    }
  }, [utilizador, navigation]);

  const handleCriarTarefa = async () => {
    if (!descricao.trim()) {
      setMensagem('A descrição é obrigatória');
      setErro(true);
      return;
    }

    try {
      setEstaAGuardar(true);
      await tarefaServico.criarTarefa({ descricao });
      setMensagem('Tarefa criada com sucesso!');
      setErro(false);
      
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      setMensagem(error.mensagemAPI || 'Não foi possível criar a tarefa.');
      setErro(true);
    } finally {
      setEstaAGuardar(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Nova Tarefa</Title>
            
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
              placeholder="Introduza a descrição da tarefa..."
            />

            <Button
              mode="contained"
              onPress={handleCriarTarefa}
              loading={estaAGuardar}
              disabled={estaAGuardar}
              style={styles.button}
            >
              Criar Tarefa
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
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
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