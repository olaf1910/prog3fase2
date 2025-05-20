import apiClient, { verificarCarregamento } from './api';

const tarefaServico = {
  aCarregar: verificarCarregamento,

  procurarTodasAsTarefas: async () => {
    try {
      const resposta = await apiClient.get('/tarefas');
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  criarTarefa: async (dados) => {
    try {
      const resposta = await apiClient.post('/tarefas', dados);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  atualizarTarefa: async (idTarefa, dados) => {
    try {
      const resposta = await apiClient.put(`/tarefas/${idTarefa}`, dados);
      return resposta.data;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  eliminarTarefa: async (idTarefa) => {
    try {
      await apiClient.delete(`/tarefas/${idTarefa}`);
      return true;
    } catch (erro) {
      // Propagar o erro original para manter as mensagens formatadas do api.js
      throw erro;
    }
  },

  // Método utilitário para verificar se há erros de validação
  verificarErrosValidacao: (erro) => {
    return erro.response?.status === 400 && erro.response?.data?.erro;
  }
};

export default tarefaServico;