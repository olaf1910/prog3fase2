import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  HelperText,
  Surface,
  Title,
  Divider,
  RadioButton
} from 'react-native-paper';
import { utilizadorServico } from '../services/utilizadorServico';

const FUNCOES = ['admin', 'gerente', 'lider_equipa', 'programador'];

const EditUserModal = ({ visible, onDismiss, utilizador, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome_utilizador: utilizador.nome_utilizador,
    email: utilizador.email,
    funcao: utilizador.funcao
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const validate = () => {
    const newErrors = {};
    
    // Nome de utilizador validation
    if (!formData.nome_utilizador.trim())
      newErrors.nome_utilizador = 'Nome de utilizador é obrigatório';
      
    // Email validation
    if (!formData.email.trim())
      newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email é inválido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    setApiError('');
    
    if (!validate()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      await utilizadorServico.atualizarUtilizador(utilizador.id, formData);
      onSuccess();
      onDismiss();
    } catch (error) {
      setApiError(error.mensagemAPI || 'Erro ao atualizar utilizador. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDismiss = () => {
    if (!submitting) {
      onDismiss();
    }
  };
  
  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={handleDismiss} 
        contentContainerStyle={styles.modal}
        dismissable={!submitting}
      >
        <Surface style={styles.surface}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Title style={styles.title}>Editar Utilizador</Title>
            <Text style={styles.subtitle}>ID: {utilizador.id}</Text>
            <Divider style={styles.divider} />
            
            {apiError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.apiError}>{apiError}</Text>
              </View>
            ) : null}
            
            <TextInput
              label="Nome de Utilizador"
              value={formData.nome_utilizador}
              onChangeText={text => setFormData({...formData, nome_utilizador: text})}
              style={styles.input}
              disabled={submitting}
              error={!!errors.nome_utilizador}
              mode="outlined"
            />
            {errors.nome_utilizador ? 
              <HelperText type="error" visible={!!errors.nome_utilizador}>
                {errors.nome_utilizador}
              </HelperText> : null
            }
            
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={text => setFormData({...formData, email: text})}
              style={styles.input}
              keyboardType="email-address"
              disabled={submitting}
              error={!!errors.email}
              mode="outlined"
            />
            {errors.email ? 
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText> : null
            }
            
            <Text style={styles.pickerLabel}>Função</Text>
            <View style={[
              styles.radioContainer,
              submitting && styles.disabledContainer
            ]}>
              <RadioButton.Group
                onValueChange={value => setFormData({...formData, funcao: value})}
                value={formData.funcao}
              >
                {FUNCOES.map(funcao => (
                  <View key={funcao} style={styles.radioItem}>
                    <RadioButton.Item
                      label={funcao}
                      value={funcao}
                      disabled={submitting}
                      labelStyle={styles.radioLabel}
                    />
                  </View>
                ))}
              </RadioButton.Group>
            </View>
            
            <Text style={styles.helperText}>
              Nota: Para alterar a palavra-passe do utilizador, utilize a funcionalidade "Alterar Palavra-passe".
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={handleDismiss} 
                style={styles.button} 
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmit} 
                style={styles.button} 
                disabled={submitting}
                loading={submitting}
              >
                {submitting ? 'A guardar...' : 'Guardar'}
              </Button>
            </View>
          </ScrollView>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    padding: 20,
    margin: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    marginBottom: 0,
    textAlign: 'center',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  divider: {
    marginTop: 8,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  pickerLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 12,
    color: '#666',
    paddingLeft: 12,
  },
  radioContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  radioItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  radioLabel: {
    fontSize: 14,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  apiError: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  }
});

export default EditUserModal;