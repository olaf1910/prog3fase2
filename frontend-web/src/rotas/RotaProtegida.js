// src/rotas/RotaProtegida.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';

const RotaProtegida = ({ children, adminBloqueado = false }) => {
  const { estaAutenticado, aCarregarAutenticacao, funcaoUtilizador } = useAuth();
  const location = useLocation();

  if (aCarregarAutenticacao) {
    // Pode mostrar um spinner/indicador de carregamento aqui
    // enquanto o estado de autenticação inicial está a ser verificado
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        A verificar autenticação...
      </div>
    );
  }

  if (!estaAutenticado) {
    // Redireciona para a página de login, guardando a localização atual
    // para que possamos redirecionar de volta após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Bloquear acesso a admin em rotas marcadas como adminBloqueado
  if (adminBloqueado && funcaoUtilizador === 'admin') {
    console.warn('Acesso negado: Esta área não está disponível para utilizadores admin');
    return <Navigate to="/" replace />;
  }

  return children; // Renderiza o componente filho se estiver autenticado e tiver permissões
};

export default RotaProtegida;