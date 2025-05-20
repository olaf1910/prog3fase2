import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const autenticacaoServico = {
  async login(credenciais) {
    try {
      const dadosFormatados = {
        nome_utilizador: credenciais.nomeUtilizador,
        palavra_passe: credenciais.palavraPasse
      };
      
      console.log('A tentar autenticar com:', {
        ...dadosFormatados,
        palavra_passe: '[REDACTED]'
      });

      const resposta = await api.post('/utilizadores/login', dadosFormatados);
      
      if (!resposta.data.token) {
        throw new Error('Token não recebido na resposta do servidor.');
      }

      console.log('Autenticação bem sucedida:', {
        statusCode: resposta.status,
        hasToken: !!resposta.data.token
      });

      return resposta.data;
    } catch (erro) {
      console.error('Erro detalhado na autenticação:', {
        message: erro.message,
        status: erro.response?.status,
        data: erro.response?.data,
        config: erro.config
      });

      if (erro.response?.status === 401) {
        throw new Error('Credenciais inválidas');
      }

      throw erro;
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      console.log('Sessão terminada com sucesso.');
    } catch (erro) {
      console.error('Não foi possível terminar a sessão:', erro);
      throw erro;
    }
  },
};

export default autenticacaoServico;