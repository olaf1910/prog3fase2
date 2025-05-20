import React, { createContext, useState, useContext } from 'react';
import servicoAutenticacao from '../servicos/autenticacaoServico';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [utilizador, setUtilizador] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        return {
          ...jwtDecode(token),
          token
        };
      } catch (erro) {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const login = async (credenciais) => {
    try {
      const resposta = await servicoAutenticacao.login(credenciais);
      const dados = jwtDecode(resposta.token);
      const dadosUtilizador = {
        ...dados,
        token: resposta.token
      };
      localStorage.setItem('token', resposta.token);
      setUtilizador(dadosUtilizador);
      return dadosUtilizador;
    } catch (erro) {
      localStorage.removeItem('token');
      setUtilizador(null);
      throw erro;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUtilizador(null);
  };

  const valor = {
    utilizadorAtual: utilizador,
    token: utilizador?.token,
    estaAutenticado: !!utilizador,
    funcaoUtilizador: utilizador?.funcao,
    idUtilizador: utilizador?.utilizador_id,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};