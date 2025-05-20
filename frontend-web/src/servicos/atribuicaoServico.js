import apiClient from './api';

const atribuicaoServico = {
  atribuirTarefa: async (dados) => {
    try {
      const resposta = await apiClient.post('/atribuicoes', dados);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  atualizarProgressoAtribuicao: async (idAtribuicao, dados) => {
    try {
      const resposta = await apiClient.patch(`/atribuicoes/${idAtribuicao}`, dados);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  }
};

export default atribuicaoServico;