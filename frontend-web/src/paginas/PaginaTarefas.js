import React, { useState, useEffect } from 'react';
import { useAuth } from '../contextos/AuthContext';
import tarefaServico from '../servicos/tarefaServico';
import utilizadorServico from '../servicos/utilizadorServico';
import atribuicaoServico from '../servicos/atribuicaoServico';
import { Card, ListGroup, Spinner, Alert, Container, Row, Col, Badge, Button, Modal, Form } from 'react-bootstrap';
import { 
    PlusCircleFill, PencilSquare, Trash3, PersonCheckFill, 
    PlayCircleFill, CheckCircleFill, StarFill
} from 'react-bootstrap-icons';

const PaginaTarefas = () => {
  const [tarefas, setTarefas] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [operacaoEmCurso, setOperacaoEmCurso] = useState(false);
  const [erro, setErro] = useState('');
  const { idUtilizador, funcaoUtilizador } = useAuth();

  // Estado Modal
  const [modalAtivo, setModalAtivo] = useState(null); // 'criar', 'editar', 'eliminar', 'atribuir'
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [descricaoTarefa, setDescricaoTarefa] = useState('');

  // Estado Programadores
  const [programadores, setProgramadores] = useState([]);
  const [programadorSelecionadoId, setProgramadorSelecionadoId] = useState('');
  const [competenciasProgramador, setCompetenciasProgramador] = useState([]);

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    setACarregar(true);
    setErro('');
    try {
      const dados = await tarefaServico.procurarTodasAsTarefas();
      setTarefas(dados);
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
      setErro(`Não foi possível carregar as tarefas${mensagem ? ` - ${mensagem}` : '.'}`);
    } finally {
      setACarregar(false);
    }
  };

  const formatarEstado = (estado) => {
    switch (estado) {
      case 'nao_atribuida': return { texto: 'Não Atribuída', bg: 'secondary' };
      case 'atribuida': return { texto: 'Atribuída', bg: 'info' };
      case 'em_progresso': return { texto: 'Em Progresso', bg: 'primary' };
      case 'concluida': return { texto: 'Concluída', bg: 'success' };
      default: return { texto: estado, bg: 'light' };
    }
  };

  // Funções de Modal
  const abrirModal = (tipo, tarefa = null) => {
    setModalAtivo(tipo);
    setTarefaSelecionada(tarefa);
    setDescricaoTarefa(tarefa?.descricao || '');
    setErro('');

    if (tipo === 'atribuir') {
      carregarProgramadores();
    }
  };

  const fecharModal = () => {
    setModalAtivo(null);
    setTarefaSelecionada(null);
    setDescricaoTarefa('');
    setProgramadorSelecionadoId('');
    setCompetenciasProgramador([]);
  };

  // Funções de Tarefa
  const criarTarefa = async (evento) => {
    evento.preventDefault();
    if (!descricaoTarefa.trim()) {
      setErro('A descrição não pode estar vazia.');
      return;
    }

    setOperacaoEmCurso(true);
    try {
      await tarefaServico.criarTarefa({ descricao: descricaoTarefa });
      fecharModal();
      carregarTarefas();
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
      setErro(`Não foi possível criar a tarefa${mensagem ? ` - ${mensagem}` : '.'}`);
    } finally {
      setOperacaoEmCurso(false);
    }
  };

  const editarTarefa = async (evento) => {
    evento.preventDefault();
    if (!descricaoTarefa.trim()) {
      setErro('A descrição não pode estar vazia.');
      return;
    }

    setOperacaoEmCurso(true);
    try {
      await tarefaServico.atualizarTarefa(tarefaSelecionada.id, { descricao: descricaoTarefa });
      fecharModal();
      carregarTarefas();
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
      setErro(`Não foi possível atualizar a tarefa${mensagem ? ` - ${mensagem}` : '.'}`);
    } finally {
      setOperacaoEmCurso(false);
    }
  };

  const eliminarTarefa = async () => {
    try {
      await tarefaServico.eliminarTarefa(tarefaSelecionada.id);
      fecharModal();
      carregarTarefas();
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
      setErro(`Não foi possível eliminar a tarefa${mensagem ? ` - ${mensagem}` : '.'}`);
    }
  };

  // Funções de Programador
  const carregarProgramadores = async () => {
    try {
      const utilizadores = await utilizadorServico.buscarTodos();
      setProgramadores(utilizadores.filter(u => u.funcao === 'programador'));
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
      setErro(`Não foi possível carregar os programadores${mensagem ? ` - ${mensagem}` : '.'}`);
    }
  };

  const selecionarProgramador = async (evento) => {
    const progId = evento.target.value;
    setProgramadorSelecionadoId(progId);
    
    if (progId) {
      try {
        const competencias = await utilizadorServico.buscarCompetenciasUtilizador(parseInt(progId));
        setCompetenciasProgramador(competencias);
      } catch (erro) {
        const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
        setErro(`Não foi possível carregar as competências do programador${mensagem ? ` - ${mensagem}` : '.'}`);
      }
    }
  };

  const atribuirTarefa = async (evento) => {
    evento.preventDefault();
    if (!programadorSelecionadoId) {
      setErro('Selecione um programador.');
      return;
    }

    try {
      await atribuicaoServico.atribuirTarefa({
        tarefa_id: tarefaSelecionada.id,
        atribuido_a: parseInt(programadorSelecionadoId)
      });
      fecharModal();
      carregarTarefas();
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
      setErro(`Não foi possível atribuir a tarefa${mensagem ? ` - ${mensagem}` : '.'}`);
    }
  };

  // Funções de Progresso
  const iniciarTarefa = async (tarefa) => {
    try {
      await atribuicaoServico.atualizarProgressoAtribuicao(tarefa.atribuicao_id, { 
        inicio: new Date().toISOString() 
      });
      carregarTarefas();
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
      setErro(`Não foi possível iniciar a tarefa${mensagem ? ` - ${mensagem}` : '.'}`);
    }
  };

  const concluirTarefa = async (tarefa) => {
    try {
      await atribuicaoServico.atualizarProgressoAtribuicao(tarefa.atribuicao_id, { 
        fim: new Date().toISOString() 
      });
      carregarTarefas();
    } catch (erro) {
      const mensagem = erro.response?.data?.mensagem || erro.mensagemAPI;
      setErro(`Não foi possível concluir a tarefa${mensagem ? ` - ${mensagem}` : '.'}`);
    }
  };

  if (aCarregar && tarefas.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>A carregar as tarefas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4 align-items-center">
        <Col><h2 className="mb-0">Lista de Tarefas</h2></Col>
        {funcaoUtilizador === 'gerente' && (
          <Col xs="auto">
            <Button
              variant="success"
              onClick={() => abrirModal('criar')}
              className="d-flex align-items-center"
            >
              <PlusCircleFill className="me-2" /> Criar Nova Tarefa
            </Button>
          </Col>
        )}
      </Row>

      {erro && <Alert variant="danger" onClose={() => setErro('')} dismissible>{erro}</Alert>}

      {!aCarregar && tarefas.length === 0 ? (
        <Alert variant="info">Não existem tarefas para apresentar.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {tarefas.map((tarefa) => {
            const estado = formatarEstado(tarefa.estado);
            const podeGerenteModificar = funcaoUtilizador === 'gerente' && tarefa.criado_por === idUtilizador && tarefa.estado === 'nao_atribuida';
            const podeLiderAtribuir = funcaoUtilizador === 'lider_equipa' && tarefa.estado === 'nao_atribuida';
            const ehMinhaTarefa = funcaoUtilizador === 'programador' && tarefa.utilizador_atribuido_id === idUtilizador;

            return (
              <Col key={tarefa.id}>
                <Card className="h-100 shadow-sm hover-shadow">
                  <Card.Header className="d-flex justify-content-between align-items-center py-2">
                    <span className="fw-bold">Tarefa #{tarefa.id}</span>
                    <Badge bg={estado.bg} className="px-3 py-2">{estado.texto}</Badge>
                  </Card.Header>
                  <Card.Body className="d-flex flex-column">
                    <Card.Text className="flex-grow-1 mb-3">{tarefa.descricao}</Card.Text>
                    <ListGroup variant="flush" className="mb-2">
                      <ListGroup.Item>
                        <strong>Criada em:</strong> {new Date(tarefa.criado_em).toLocaleDateString('pt-PT')}
                      </ListGroup.Item>
                      {tarefa.utilizador_atribuido_nome && (
                        <ListGroup.Item>
                          <strong>Atribuída a:</strong> {tarefa.utilizador_atribuido_nome}
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card.Body>
                  <Card.Footer className="d-flex gap-2 justify-content-start py-2">
                    {podeGerenteModificar && (
                      <>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => abrirModal('editar', tarefa)}
                          className="d-flex align-items-center"
                        >
                          <PencilSquare className="me-1" /> Editar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => abrirModal('eliminar', tarefa)}
                          className="d-flex align-items-center"
                        >
                          <Trash3 className="me-1" /> Eliminar
                        </Button>
                      </>
                    )}
                    {podeLiderAtribuir && (
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => abrirModal('atribuir', tarefa)}
                        className="d-flex align-items-center"
                      >
                        <PersonCheckFill className="me-1" /> Atribuir
                      </Button>
                    )}
                    {ehMinhaTarefa && tarefa.estado === 'atribuida' && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => iniciarTarefa(tarefa)}
                        className="d-flex align-items-center"
                      >
                        <PlayCircleFill className="me-1" /> Iniciar
                      </Button>
                    )}
                    {ehMinhaTarefa && tarefa.estado === 'em_progresso' && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => concluirTarefa(tarefa)}
                        className="d-flex align-items-center"
                      >
                        <CheckCircleFill className="me-1" /> Concluir
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Modal Criar/Editar */}
      <Modal show={modalAtivo === 'criar' || modalAtivo === 'editar'} onHide={fecharModal}>
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">
            {modalAtivo === 'criar' ? 'Criar Nova Tarefa' : 'Editar Tarefa'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={modalAtivo === 'criar' ? criarTarefa : editarTarefa}>
          <Modal.Body className="py-4">
            {erro && <Alert variant="danger">{erro}</Alert>}
            <Form.Group>
              <Form.Label className="fw-bold mb-2">Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={descricaoTarefa}
                onChange={(e) => setDescricaoTarefa(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={operacaoEmCurso}>
              {operacaoEmCurso && <Spinner animation="border" size="sm" className="me-2" />}
              {modalAtivo === 'criar' ? 'Criar' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal show={modalAtivo === 'eliminar'} onHide={fecharModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {erro && <Alert variant="danger">{erro}</Alert>}
          <p>Tem a certeza que pretende eliminar esta tarefa?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
          <Button variant="danger" onClick={eliminarTarefa} disabled={operacaoEmCurso}>
            {operacaoEmCurso && <Spinner animation="border" size="sm" className="me-2" />}
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Atribuir */}
      <Modal show={modalAtivo === 'atribuir'} onHide={fecharModal}>
        <Modal.Header closeButton>
          <Modal.Title>Atribuir Tarefa</Modal.Title>
        </Modal.Header>
        <Form onSubmit={atribuirTarefa}>
          <Modal.Body>
            {erro && <Alert variant="danger">{erro}</Alert>}
            <Form.Group>
              <Form.Label>Programador</Form.Label>
              <Form.Select 
                value={programadorSelecionadoId} 
                onChange={selecionarProgramador}
                required
              >
                <option value="">Selecione um programador</option>
                {programadores.map(prog => (
                  <option key={prog.id} value={prog.id}>
                    {prog.nome_utilizador}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {competenciasProgramador.length > 0 && (
              <div className="mt-3">
                <h6><StarFill className="me-1" />Competências:</h6>
                <div className="d-flex flex-wrap gap-1">
                  {competenciasProgramador.map(comp => (
                    <Badge key={comp.id} bg="primary">{comp.nome}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={operacaoEmCurso}>
              {operacaoEmCurso && <Spinner animation="border" size="sm" className="me-2" />}
              Atribuir
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PaginaTarefas;