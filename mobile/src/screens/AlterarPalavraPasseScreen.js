import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Card, Title, Snackbar } from 'react-native-paper';
import { utilizadorServico } from '../services/utilizadorServico';
import { useAuth } from '../contexts/AuthContext';

export default function AlterarPalavraPasseScreen({ navigation }) {
  const { utilizador } = useAuth();
  const [palavraPasseAtual, setPalavraPasseAtual] = useState('');
  const [novaPalavraPasse, setNovaPalavraPasse] = useState('');
  const [confirmarPalavraPasse, setConfirmarPalavraPasse] = useState('');
  const [estaAProcessar, setEstaAProcessar] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const validarFormulario = () => {
    if (!palavraPasseAtual || !novaPalavraPasse || !confirmarPalavraPasse) {
      setErro('É necessário preencher todos os campos.');
      return false;
    }

    if (novaPalavraPasse !== confirmarPalavraPasse) {
      setErro('As palavras-passe não coincidem.');
      return false;
    }

    if (novaPalavraPasse.length < 8) {
      setErro('A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return false;
    }

    // Validar complexidade da palavra-passe
    const regexPalavraPasse = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regexPalavraPasse.test(novaPalavraPasse)) {
      setErro('A palavra-passe deve conter letras maiúsculas, minúsculas, números e caracteres especiais.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    setEstaAProcessar(true);
    setErro('');

    try {
      await utilizadorServico.alterarPalavraPasse(
        utilizador.id,
        palavraPasseAtual,
        novaPalavraPasse
      );
      
      setMensagem('Palavra-passe alterada com sucesso!');
      
      // Limpar campos
      setPalavraPasseAtual('');
      setNovaPalavraPasse('');
      setConfirmarPalavraPasse('');
      
      // Voltar para o ecrã de perfil após 2 segundos
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (erro) {
      setErro(erro.mensagemAPI || 'Não foi possível alterar a palavra-passe.');
    } finally {
      setEstaAProcessar(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Alterar Palavra-passe</Title>

          <TextInput
            mode="outlined"
            label="Palavra-passe Actual"
            value={palavraPasseAtual}
            onChangeText={setPalavraPasseAtual}
            secureTextEntry
            style={styles.input}
            disabled={estaAProcessar}
          />

          <TextInput
            mode="outlined"
            label="Nova Palavra-passe"
            value={novaPalavraPasse}
            onChangeText={setNovaPalavraPasse}
            secureTextEntry
            style={styles.input}
            disabled={estaAProcessar}
          />

          <TextInput
            mode="outlined"
            label="Confirmar Nova Palavra-passe"
            value={confirmarPalavraPasse}
            onChangeText={setConfirmarPalavraPasse}
            secureTextEntry
            style={styles.input}
            disabled={estaAProcessar}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={estaAProcessar}
            disabled={estaAProcessar}
            style={styles.button}
          >
            {estaAProcessar ? 'A actualizar...' : 'Alterar Palavra-passe'}
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={!!erro || !!mensagem}
        onDismiss={() => {
          setErro('');
          setMensagem('');
        }}
        duration={3000}
        style={[
          styles.snackbar,
          erro ? styles.errorSnackbar : styles.successSnackbar
        ]}
      >
        {erro || mensagem}
      </Snackbar>
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
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    color: '#2196F3',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2196F3',
  },
  snackbar: {
    margin: 16,
  },
  errorSnackbar: {
    backgroundColor: '#D32F2F',
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
});