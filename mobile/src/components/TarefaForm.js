import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';

export default function TarefaForm({ tarefa, onSubmit, estaASubmeter }) {
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (tarefa) {
      setDescricao(tarefa.descricao || '');
    }
  }, [tarefa]);

  const handleSubmit = () => {
    if (!descricao.trim()) {
      setErro('A descrição é obrigatória');
      return;
    }

    setErro('');
    onSubmit({ descricao });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Descrição da Tarefa"
        value={descricao}
        onChangeText={setDescricao}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
        disabled={estaASubmeter}
      />
      
      {erro ? (
        <HelperText type="error" visible={!!erro}>
          {erro}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={estaASubmeter}
        disabled={estaASubmeter}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {tarefa ? 'Atualizar Tarefa' : 'Criar Tarefa'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2196F3',
  },
  buttonContent: {
    height: 48,
  },
});