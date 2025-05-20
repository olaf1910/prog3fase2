import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Text, Card } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [nomeUtilizador, setNomeUtilizador] = useState('');
  const [palavraPasse, setPalavraPasse] = useState('');
  const [erro, setErro] = useState('');
  const [estaAProcessar, setEstaAProcessar] = useState(false);

  const { iniciarSessao } = useAuth();

  const handleLogin = async () => {
    if (!nomeUtilizador || !palavraPasse) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    setErro('');
    setEstaAProcessar(true);

    try {
      await iniciarSessao({ nomeUtilizador, palavraPasse });
    } catch (error) {
      setErro(error.mensagemAPI || 'Erro ao iniciar sessão. Tente novamente.');
    } finally {
      setEstaAProcessar(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Title style={styles.title}>FeedzzTrab</Title>
        
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <TextInput
              label="Nome de Utilizador"
              value={nomeUtilizador}
              onChangeText={setNomeUtilizador}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              disabled={estaAProcessar}
            />

            <TextInput
              label="Palavra-passe"
              value={palavraPasse}
              onChangeText={setPalavraPasse}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              disabled={estaAProcessar}
            />

            {erro ? (
              <Text style={styles.erro}>{erro}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={estaAProcessar}
              disabled={estaAProcessar}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {estaAProcessar ? 'A autenticar...' : 'Iniciar Sessão'}
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: 'center',
    color: '#2196F3',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#2196F3',
  },
  buttonContent: {
    height: 48,
  },
  erro: {
    color: '#D32F2F',
    marginTop: 8,
    textAlign: 'center',
  },
});