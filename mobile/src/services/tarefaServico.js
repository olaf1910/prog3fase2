import api from './api';

export const tarefaServico = {
  async procurarTodasAsTarefas() {
    try {
      console.log('A obter todas as tarefas...');
      const resposta = await api.get('/tarefas');
      console.log('Tarefas recebidas:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível obter as tarefas:', erro.response?.data || erro.message);
      throw erro;
    }
  },

  async criarTarefa(dados) {
    try {
      console.log('A criar tarefa:', dados);
      // Nova tarefa sempre começa como não atribuída
      const resposta = await api.post('/tarefas', {
        ...dados,
        estado: 'nao_atribuida'
      });
      console.log('Tarefa criada:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível criar a tarefa:', erro.response?.data || erro.message);
      throw erro;
    }
  },

  async atualizarTarefa(tarefaId, dados) {
    try {
      console.log('A actualizar tarefa:', { id: tarefaId, dados });
      const resposta = await api.put(`/tarefas/${tarefaId}`, dados);
      console.log('Tarefa actualizada:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível actualizar a tarefa:', erro.response?.data || erro.message);
      throw erro;
    }
  },

  async eliminarTarefa(tarefaId) {
    try {
      console.log('A eliminar tarefa:', tarefaId);
      const resposta = await api.delete(`/tarefas/${tarefaId}`);
      console.log('Tarefa eliminada:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível eliminar a tarefa:', erro.response?.data || erro.message);
      throw erro;
    }
  },

  async mudarEstadoTarefa(tarefa, novoEstado) {
    try {
      console.log('A alterar o estado da tarefa:', { id: tarefa.id, estado: novoEstado, atribuicao_id: tarefa.atribuicao_id });
      
      if (!tarefa.atribuicao_id) {
        console.error('A tarefa não tem atribuição');
        throw new Error('A tarefa não está atribuída a nenhum utilizador');
      }
      
      let dados = {};
      if (novoEstado === 'em_progresso') {
        dados.inicio = new Date().toISOString();
      } else if (novoEstado === 'concluida') {
        dados.fim = new Date().toISOString();
      }
      
      // Usar o endpoint correto para alterar o estado via atribuições
      const resposta = await api.patch(`/atribuicoes/${tarefa.atribuicao_id}`, dados);
      
      console.log('Estado da tarefa actualizado:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível alterar o estado da tarefa:', erro.response?.data || erro.message);
      throw erro;
    }
  },

  async atribuirTarefa(tarefaId, utilizador) {
    try {
      console.log('A atribuir tarefa:', { tarefaId, utilizador });
      
      // Usar o endpoint específico de atribuições
      // Nota: O campo "atribuido_a" é exigido pela API, mesmo que
      // nos dados recebidos o campo seja "utilizador_atribuido_id"
      const resposta = await api.post('/atribuicoes', {
        tarefa_id: tarefaId,
        atribuido_a: utilizador.id
      });
      
      console.log('Tarefa atribuída:', resposta.data);
      return resposta.data;
    } catch (erro) {
      console.error('Não foi possível atribuir a tarefa:', erro.response?.data || erro.message);
      throw erro;
    }
  }
};

export default tarefaServico;