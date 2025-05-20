import api from './api';

export const utilizadorServico = {
  async procurarTodosOsUtilizadores() {
    try {
      console.log('A obter todos os utilizadores...');
      const resposta = await api.get('/utilizadores');
      console.log('Utilizadores recebidos:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível obter os utilizadores:', erro.response?.data || erro.message);
      throw erro;
    }
  },

  async procurarUtilizadorPorId(id) {
    try {
      console.log('A obter utilizador:', id);
      const resposta = await api.get(`/utilizadores/${id}`);
      console.log('Utilizador recebido:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível obter o utilizador:', erro.response?.data || erro.message);
      throw erro;
    }
  },

  async alterarPalavraPasse(utilizadorId, palavraPasseAtual, novaPalavraPasse) {
    try {
      console.log('A alterar a palavra-passe para o utilizador:', utilizadorId);
      const resposta = await api.patch(`/utilizadores/${utilizadorId}/palavra_passe`, {
        palavra_passe_atual: palavraPasseAtual,
        nova_palavra_passe: novaPalavraPasse
      });
      console.log('Palavra-passe alterada com sucesso.');
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível alterar a palavra-passe:', erro.response?.data || erro.message);
      
      // Transformar erro da API num formato mais amigável
      const mensagemAPI = erro.response?.data?.mensagem;
      if (mensagemAPI) {
        const erro = new Error(mensagemAPI);
        erro.mensagemAPI = mensagemAPI;
        throw erro;
      }
      
      throw erro;
    }
  },
  
  // Obter competências do utilizador
  async obterCompetenciasUtilizador(utilizadorId) {
    try {
      console.log('A obter competências do utilizador:', utilizadorId);
      const resposta = await api.get(`/utilizadores/${utilizadorId}/competencias`);
      console.log('Competências recebidas:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível obter as competências:', erro.response?.data || erro.message);
      
      const mensagemAPI = erro.response?.data?.mensagem;
      if (mensagemAPI) {
        const erro = new Error(mensagemAPI);
        erro.mensagemAPI = mensagemAPI;
        throw erro;
      }
      
      throw erro;
    }
  },
  
  // Adicionar nova competência
  async adicionarCompetencia(utilizadorId, nomeCompetencia) {
    try {
      console.log('A adicionar competência para o utilizador:', utilizadorId);
      const resposta = await api.post(`/utilizadores/${utilizadorId}/competencias`, {
        competencia: nomeCompetencia
      });
      console.log('Competência adicionada com sucesso.');
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível adicionar a competência:', erro.response?.data || erro.message);
      
      const mensagemAPI = erro.response?.data?.mensagem;
      if (mensagemAPI) {
        const erro = new Error(mensagemAPI);
        erro.mensagemAPI = mensagemAPI;
        throw erro;
      }
      
      throw erro;
    }
  },

  // Criar novo utilizador (admin only)
  async criarUtilizador(dadosUtilizador) {
    try {
      console.log('A criar novo utilizador:', { ...dadosUtilizador, palavra_passe: '[REDACTED]' });
      const resposta = await api.post(`/utilizadores`, dadosUtilizador);
      console.log('Utilizador criado com sucesso.');
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível criar o utilizador:', erro.response?.data || erro.message);
      
      const mensagemAPI = erro.response?.data?.mensagem;
      if (mensagemAPI) {
        const erro = new Error(mensagemAPI);
        erro.mensagemAPI = mensagemAPI;
        throw erro;
      }
      
      throw erro;
    }
  },

  // Atualizar utilizador existente (admin only)
  async atualizarUtilizador(utilizadorId, dadosUtilizador) {
    try {
      console.log('A atualizar utilizador:', utilizadorId, dadosUtilizador);
      const resposta = await api.put(`/utilizadores/${utilizadorId}`, dadosUtilizador);
      console.log('Utilizador atualizado com sucesso.');
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível atualizar o utilizador:', erro.response?.data || erro.message);
      
      const mensagemAPI = erro.response?.data?.mensagem;
      if (mensagemAPI) {
        const erro = new Error(mensagemAPI);
        erro.mensagemAPI = mensagemAPI;
        throw erro;
      }
      
      throw erro;
    }
  },

  // Eliminar utilizador (admin only)
  async eliminarUtilizador(utilizadorId) {
    try {
      console.log('A eliminar utilizador:', utilizadorId);
      const resposta = await api.delete(`/utilizadores/${utilizadorId}`);
      console.log('Utilizador eliminado com sucesso.');
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível eliminar o utilizador:', erro.response?.data || erro.message);
      
      const mensagemAPI = erro.response?.data?.mensagem;
      if (mensagemAPI) {
        const erro = new Error(mensagemAPI);
        erro.mensagemAPI = mensagemAPI;
        throw erro;
      }
      
      throw erro;
    }
  }
};

export default utilizadorServico;