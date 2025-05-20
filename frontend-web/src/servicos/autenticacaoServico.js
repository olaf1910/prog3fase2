import apiClient from './api';

const servicoAutenticacao = {
  login: async (credenciais) => {
    try {
      const resposta = await apiClient.post('/utilizadores/login', credenciais);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  }
};

export default servicoAutenticacao;