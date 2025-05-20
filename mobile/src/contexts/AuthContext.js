import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import decode from 'jwt-decode';  // Changed import syntax
import { autenticacaoServico } from '../services/autenticacaoServico';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);
  const [estaAAutenticar, setEstaAAutenticar] = useState(false);
  const [estaAVerificarToken, setEstaAVerificarToken] = useState(true);

  useEffect(() => {
    async function carregarUtilizadorGuardado() {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          console.log('Token encontrado em armazenamento local');
          try {
            const decoded = decode(token);
            
            // Verificar se o token ainda é válido (não está expirado)
            const dataAtual = Date.now() / 1000;
            if (decoded.exp && decoded.exp < dataAtual) {
              console.log('Token expirado, a fazer logout');
              await terminarSessao();
              return;
            }
            
            console.log('Sessão restaurada para:', decoded.nome_utilizador);
            setUtilizador(decoded);
          } catch (erro) {
            console.error('Erro ao descodificar token:', erro);
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (erro) {
        console.error('Erro ao verificar autenticação guardada:', erro);
      } finally {
        setEstaAVerificarToken(false);
      }
    }

    carregarUtilizadorGuardado();
  }, []);

  const iniciarSessao = async (credenciais) => {
    try {
      console.log('A iniciar sessão com:', {
        ...credenciais,
        palavraPasse: '[REDACTED]'
      });
      
      const { token } = await autenticacaoServico.login(credenciais);
      console.log('Token recebido:', token);
      
      await AsyncStorage.setItem('token', token);
      const decoded = decode(token);  // Using decode instead of jwt_decode
      console.log('Dados do utilizador:', decoded);
      
      setUtilizador(decoded);
    } catch (erro) {
      console.log('Não foi possível iniciar a sessão:', erro);
      throw erro;
    }
  };

  const terminarSessao = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUtilizador(null);
    } catch (erro) {
      console.error('Não foi possível terminar a sessão:', erro);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        utilizador,
        estaAAutenticar,
        estaAVerificarToken,
        iniciarSessao,
        terminarSessao,
        estaAutenticado: !!utilizador,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}