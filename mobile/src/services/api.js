import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.200.91:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(async (config) => {
  try {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (erro) {
    console.error('Erro no interceptor de pedido:', erro);
    return Promise.reject(erro);
  }
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (erro) => {
    console.error('API Error:', {
      status: erro.response?.status,
      data: erro.response?.data,
      message: erro.message
    });
    
    if (erro.response?.data?.mensagem) {
      erro.mensagemAPI = erro.response.data.mensagem;
    }
    return Promise.reject(erro);
  }
);

export default api;