// src/paginas/PaginaInicial.js
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contextos/AuthContext';
import tarefaServico from '../servicos/tarefaServico';
import utilizadorServico from '../servicos/utilizadorServico';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, ListGroup, Badge, Button } from 'react-bootstrap';
import { ListCheck, PeopleFill, HourglassSplit, ClipboardPlus } from 'react-bootstrap-icons';

const PaginaInicial = () => {
  const { estaAutenticado, funcaoUtilizador, idUtilizador, utilizadorAtual } = useAuth();

  const [dadosDashboard, setDadosDashboard] = useState(null);
  const [aCarregarDashboard, setACarregarDashboard] = useState(false);
  const [erroDashboard, setErroDashboard] = useState('');
  useEffect(() => {
    if (estaAutenticado) {
      const carregarDadosDashboard = async () => {
        setACarregarDashboard(true);
        setErroDashboard('');
        try {
          let dadosEspecificos = {};
          
          // Admin users should only fetch user data, not tasks
          if (funcaoUtilizador === 'admin') {
            const todosUtilizadores = await utilizadorServico.buscarTodos();
            dadosEspecificos = { todosUtilizadores };
          }
          // For non-admin users, fetch tasks
          else {
            try {
              const todasTarefas = await tarefaServico.procurarTodasAsTarefas();
              dadosEspecificos.todasTarefas = todasTarefas;
              
              // Lider de equipa needs user data too
              if (funcaoUtilizador === 'lider_equipa') {
                const todosUtilizadores = await utilizadorServico.buscarTodos();
                dadosEspecificos.todosUtilizadores = todosUtilizadores;
              }
            } catch (taskError) {
              console.error('Error fetching tasks:', taskError);
              // Still allow dashboard to load with partial data
              dadosEspecificos.todasTarefas = [];
            }
          }
          
          setDadosDashboard(dadosEspecificos);
        } catch (err) {
          console.error('Dashboard error:', err);
          setErroDashboard(err.mensagemCompleta || "Falha ao carregar dados para o dashboard.");
        } finally {
          setACarregarDashboard(false);
        }
      };
      carregarDadosDashboard();
    }
  }, [estaAutenticado, funcaoUtilizador]);

  const DashboardProgramador = ({ tarefas }) => {
    const minhasTarefas = useMemo(() => 
      tarefas.filter(t => t.utilizador_atribuido_id === idUtilizador && (t.estado === 'atribuida' || t.estado === 'em_progresso'))
      .sort((a,b) => {
          if (a.estado === 'em_progresso' && b.estado !== 'em_progresso') return -1;
          if (a.estado !== 'em_progresso' && b.estado === 'em_progresso') return 1;
          if (a.estado === 'atribuida' && b.estado !== 'atribuida') return -1;
          if (a.estado !== 'atribuida' && b.estado === 'atribuida') return 1;
          return new Date(b.criado_em) - new Date(a.criado_em);
        }
      ),
      [tarefas]
    );

    return (
      <Card className="h-100 shadow-sm hover-shadow">
        <Card.Header as="h5" className="d-flex align-items-center bg-light">
          <HourglassSplit className="me-2"/> Minhas Tarefas Ativas
        </Card.Header>
        <Card.Body className="p-3">
          {minhasTarefas.length === 0 ? (
            <p>Não tem tarefas ativas de momento. Bom trabalho!</p>
          ) : (
            <ListGroup variant="flush">
              {minhasTarefas.slice(0, 5).map(t => (
                <ListGroup.Item key={t.id} action as={Link} to="/tarefas" className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-bold">Tarefa #{t.id}</div>
                    {t.descricao.substring(0, 70)}{t.descricao.length > 70 ? '...' : ''}
                  </div>
                  <Badge bg={t.estado === 'em_progresso' ? 'primary' : 'info'} pill>
                    {t.estado === 'em_progresso' ? 'Em Progresso' : 'Atribuída'}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
           {minhasTarefas.length > 0 && (
             <Button
               variant="outline-primary"
               as={Link}
               to="/tarefas"
               className="mt-4 w-100 d-flex align-items-center justify-content-center"
             >
               Ver Todas as Minhas Tarefas ({minhasTarefas.length})
             </Button>
           )}
        </Card.Body>
      </Card>
    );
  };

  const DashboardLiderEquipa = ({ tarefas, utilizadores }) => {
    const tarefasNaoAtribuidas = useMemo(() => tarefas.filter(t => t.estado === 'nao_atribuida'), [tarefas]);
    const programadores = useMemo(() => utilizadores.filter(u => u.funcao === 'programador'), [utilizadores]);

    return (
      <>
        <Card className="mb-4 shadow-sm hover-shadow">
          <Card.Header as="h5" className="d-flex align-items-center bg-light">
            <ClipboardPlus className="me-2"/>Tarefas por Atribuir
          </Card.Header>
          <Card.Body className="py-4">
            <h4 className="display-6"><Badge pill bg={tarefasNaoAtribuidas.length > 0 ? "warning" : "success"}>{tarefasNaoAtribuidas.length}</Badge></h4>
            <p>Tarefa(s) não atribuída(s)</p>
            <Button variant="info" as={Link} to="/tarefas">Ir para Gestão de Tarefas</Button>
          </Card.Body>
        </Card>
        <Card className="shadow-sm hover-shadow">
          <Card.Header as="h5" className="d-flex align-items-center bg-light">
            <PeopleFill className="me-2"/>Programadores
          </Card.Header>
          <Card.Body className="py-4">
             {programadores.length === 0 ? <p>Não há programadores no sistema.</p> : <p className="display-6"><Badge pill bg="secondary">{programadores.length}</Badge></p>}
             <p>Programador(es) na equipa</p>
          </Card.Body>
        </Card>
      </>
    );
  };
  
  // RÓTULOS ALTERADOS AQUI:
  const DashboardGerente = ({ tarefas }) => {
    const minhasTarefasCriadas = useMemo(() => 
      tarefas.filter(t => t.criado_por === idUtilizador), 
      [tarefas]
    );

    const naoAtribuidas = minhasTarefasCriadas.filter(t => t.estado === 'nao_atribuida').length;
    const totalQueForamAtribuidas = minhasTarefasCriadas.filter(t => t.estado !== 'nao_atribuida').length; 
    const apenasEstadoAtribuida = minhasTarefasCriadas.filter(t => t.estado === 'atribuida').length;
    const emProgresso = minhasTarefasCriadas.filter(t => t.estado === 'em_progresso').length;
    const concluidas = minhasTarefasCriadas.filter(t => t.estado === 'concluida').length;

    return (
      <Card className="shadow-sm hover-shadow">
        <Card.Header as="h5" className="d-flex align-items-center bg-light">
          <ListCheck className="me-2"/>Resumo das Minhas Tarefas Criadas
        </Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item className="d-flex justify-content-between align-items-center">
            Total Criadas: <Badge bg="dark" pill>{minhasTarefasCriadas.length}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between align-items-center">
            Não Atribuídas: <Badge bg="secondary" pill>{naoAtribuidas}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between align-items-center">
            Já Atribuídas: <Badge bg="info" pill>{totalQueForamAtribuidas}</Badge> {/* RÓTULO ALTERADO */}
          </ListGroup.Item>
          {totalQueForamAtribuidas > 0 && (
            <>
              <ListGroup.Item className="ps-4 d-flex justify-content-between align-items-center">
                - A Aguardar Início: <Badge bg="light" text="dark" pill>{apenasEstadoAtribuida}</Badge> {/* RÓTULO ALTERADO */}
              </ListGroup.Item>
              <ListGroup.Item className="ps-4 d-flex justify-content-between align-items-center">
                - Em Progresso: <Badge bg="primary" pill>{emProgresso}</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="ps-4 d-flex justify-content-between align-items-center">
                - Concluídas: <Badge bg="success" pill>{concluidas}</Badge>
              </ListGroup.Item>
            </>
          )}
        </ListGroup>
        <Card.Body className="text-center">
          <Button variant="success" as={Link} to="/tarefas">Gerir Todas as Minhas Tarefas</Button>
        </Card.Body>
      </Card>
    );
  };

  const DashboardAdmin = ({ utilizadores }) => {
    return (
      <Card className="shadow-sm hover-shadow">
        <Card.Header as="h5" className="d-flex align-items-center bg-light">
          <PeopleFill className="me-2"/>Utilizadores
        </Card.Header>
        <Card.Body className="py-4">
          <h4 className="display-6"><Badge pill bg="primary">{utilizadores?.length || 0}</Badge></h4>
          <p>Utilizador(es) no sistema</p>
          <Button
            variant="outline-primary"
            as={Link}
            to="/admin/utilizadores"
            className="d-flex align-items-center justify-content-center"
          >
            <PeopleFill className="me-2"/>
            Gerir Utilizadores
          </Button>
        </Card.Body>
      </Card>
    );
  };

  const renderDashboardContent = () => {
    if (aCarregarDashboard) {
      return <div className="text-center"><Spinner animation="border" /> <p>A carregar dashboard...</p></div>;
    }
    if (erroDashboard) {
      return (
        <Alert variant="danger" dismissible onClose={() => setErroDashboard('')}>
          {erroDashboard}
        </Alert>
      );
    }
    if (!dadosDashboard) {
      return <Alert variant="info">A preparar o seu dashboard...</Alert>;
    }

    switch (funcaoUtilizador) {
      case 'programador':
        return <DashboardProgramador tarefas={dadosDashboard.todasTarefas} />;
      case 'lider_equipa':
        return <DashboardLiderEquipa tarefas={dadosDashboard.todasTarefas} utilizadores={dadosDashboard.todosUtilizadores || []} />;
      case 'gerente':
        return <DashboardGerente tarefas={dadosDashboard.todasTarefas} />;
      case 'admin':
        return <DashboardAdmin utilizadores={dadosDashboard.todosUtilizadores || []} />;
      default:
        return <p>Função de utilizador desconhecida. Contacte o administrador.</p>;
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>
            {estaAutenticado ? `Bem-vindo(a) de volta, ${utilizadorAtual?.nome_utilizador || 'Utilizador'}!` : 'Bem-vindo(a) ao FeedzzTrab!'}
          </h1>
          {!estaAutenticado && (
            <p className="lead">
              O seu sistema de gestão de tarefas e equipas. Faça <Link to="/login">login</Link> para começar.
            </p>
          )}
        </Col>
      </Row>

      {estaAutenticado && renderDashboardContent()}
      
      {!estaAutenticado && (
        <Row>
            <Col md={4} className="mb-3">
                <Card className="shadow-sm hover-shadow h-100">
                    <Card.Body className="p-4 text-center">
                        <Card.Title className="mb-3 fw-bold">Organize</Card.Title>
                        <Card.Text className="text-muted">Crie e atribua tarefas de forma eficiente.</Card.Text>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4} className="mb-3">
                <Card className="shadow-sm hover-shadow h-100">
                    <Card.Body className="p-4 text-center">
                        <Card.Title className="mb-3 fw-bold">Colabore</Card.Title>
                        <Card.Text className="text-muted">Mantenha a sua equipa na mesma página.</Card.Text>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4} className="mb-3">
                <Card className="shadow-sm hover-shadow h-100">
                    <Card.Body className="p-4 text-center">
                        <Card.Title className="mb-3 fw-bold">Execute</Card.Title>
                        <Card.Text className="text-muted">Acompanhe o progresso e entregue resultados.</Card.Text>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
      )}
    </Container>
  );
};

export default PaginaInicial;