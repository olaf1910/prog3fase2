// src/servicos/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000 // 3 segundos timeout
});

// Estado global de carregamento
let estaACarregar = false;

// Interceptor para adicionar o token JWT a cada requisição
apiClient.interceptors.request.use(
  (config) => {
    estaACarregar = true;
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    estaACarregar = false;
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
apiClient.interceptors.response.use(
  (response) => {
    estaACarregar = false;
    return response;
  },
  (error) => {
    estaACarregar = false;
    
    // Extrair mensagem de erro da API
    let mensagemAPI = '';
    if (error.response) {
      mensagemAPI = error.response.data?.mensagem || '';
    }
    
    // Definir mensagem amigável padrão baseada no código de erro
    let mensagemAmigavel = 'Erro na comunicação com o servidor';
    if (error.response) {
      switch (error.response.status) {
        case 400: mensagemAmigavel = 'Dados inválidos'; break;
        case 401: mensagemAmigavel = 'Não autorizado'; break;
        case 403: mensagemAmigavel = 'Acesso negado'; break;
        case 404: mensagemAmigavel = 'Recurso não encontrado'; break;
        case 500: mensagemAmigavel = 'Erro interno do servidor'; break;
        default: mensagemAmigavel = `Erro inesperado (código ${error.response.status})`; break;
      }
    }

    // Combinar mensagens
    error.mensagemCompleta = mensagemAPI
      ? `${mensagemAmigavel} - ${mensagemAPI}`
      : mensagemAmigavel;
    
    error.mensagemAmigavel = mensagemAmigavel;
    error.mensagemAPI = mensagemAPI;
    
    return Promise.reject(error);
  }
);

// Função para verificar o estado de carregamento
export const verificarCarregamento = () => estaACarregar;

export default apiClient;