import apiClient from './api';

const utilizadorServico = {
  buscarTodos: async () => {
    try {
      const resposta = await apiClient.get('/utilizadores');
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  buscarUtilizadorPorId: async (idUtilizador) => {
    try {
      const resposta = await apiClient.get(`/utilizadores/${idUtilizador}`);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  atualizarUtilizador: async (idUtilizador, dados) => {
    try {
      const resposta = await apiClient.put(`/utilizadores/${idUtilizador}`, dados);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  alterarPalavraPasse: async (idUtilizador, dados) => {
    try {
      const resposta = await apiClient.patch(`/utilizadores/${idUtilizador}/palavra_passe`, dados);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  buscarCompetenciasUtilizador: async (idUtilizador) => {
    try {
      const resposta = await apiClient.get(`/utilizadores/${idUtilizador}/competencias`);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  adicionarCompetenciaUtilizador: async (idUtilizador, competencia) => {
    try {
      const resposta = await apiClient.post(`/utilizadores/${idUtilizador}/competencias`, {
        competencia: competencia
      });
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  }
};

export default utilizadorServico;