# FEEDZZTRAB

## Visão Geral do Projeto
FEEDZZTRAB é uma aplicação web para gestão de tarefas de equipas de trabalho, desenvolvida como projeto prático para a disciplina de Programação III no Instituto Superior Miguel Torga.

### Funcionalidades Principais
- Gestão de tarefas com diferentes níveis de acesso
- Sistema de autenticação baseado em funções (RBAC)
- Atribuição e acompanhamento de tarefas
- Gestão de utilizadores e perfis
- Interface intuitiva para gestão de equipas
- **Aplicação móvel** para acesso em movimento

### Tecnologias Utilizadas
- **Frontend**: React.js
- **Backend**: Node.js com Express
- **Base de Dados**: MySQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Mobile**: React Native

### Estrutura do Projeto
```
feedzztrab/
├── frontend-web/         # Aplicação React
│   ├── src/
│   │   ├── paginas/     # Componentes de página
│   │   ├── servicos/    # Serviços e API
│   │   └── contextos/   # Contextos React
│   └── public/          # Recursos estáticos
├── feedzztrab-api/      # Backend API
│   ├── config/          # Configurações
│   ├── middlewares/     # Middlewares Express
│   └── routes/          # Rotas da API
└── mobile/              # Aplicação React Native
    ├── src/
    │   ├── components/  # Componentes reutilizáveis
    │   ├── contexts/    # Contextos React
    │   ├── navigation/  # Configuração de navegação
    │   ├── screens/     # Ecrãs da aplicação
    │   └── services/    # Serviços e API
    └── ios/ & android/  # Código nativo
```

## Instruções de Configuração

### Pré-requisitos
- Node.js (v14 ou superior)
- MySQL
- npm ou yarn
- (Para mobile) React Native environment setup

### Instalação

#### Backend (API)
1. Clone o repositório: `git clone <url>`
2. Mude para a pasta da API: `cd feedzztrab-api`
3. Instale dependências: `npm install`
4. Configure o ficheiro `.env` com:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_DATABASE`
   - `JWT_SECRET`
   - `PORT`
5. Ficheiro env de exemplo disponível em `env.example`
6. Execute: `npm run start` ou `npm run dev`

#### Frontend
1. Navegue para a pasta frontend: `cd frontend-web`
2. Instale dependências: `npm install`
3. Execute: `npm start`

#### Mobile
1. Navegue para a pasta mobile: `cd mobile`
2. Instale dependências: `npm install`
3. Para iOS: 
   - Navegue para pasta iOS: `cd ios`
   - Instale pods: `pod install`
   - Volte à pasta mobile: `cd ..`
4. Execute: `npx expo run:ios` ou `npx expo run:android`
5. Nota: Pode ser necessário atualizar o endereço IP do servidor API em `mobile/src/services/api.js`

### Configuração da Base de Dados
- Base de dados hospedada no serviço: https://freedb.tech
- Dashboard: https://freedb.tech/dashboard/stats.php
- PhpMyAdmin: https://phpmyadmin.freedb.tech

Limitações:
- MAX USER_CONNECTIONS = 100
- MAX QUERIES PER HOUR = 1000
- innodb_buffer_pool_size = 1M
- performance_schema = off

## Utilizadores de Teste
```
Admin:
- Username: admin_user
- Password: admin_user

Gerente:
- Username: gerente
- Password: Gerente!1

Líder:
- Username: lider
- Password: Lider!1xx

Programador 1:
- Username: programador
- Password: Programador!1

Programador 2:
- Username: programador2
- Password: Programador2!
```

## Documentação do Projeto

### Endpoints da API
- `/api/utilizadores/login` - Autenticação de utilizadores
- `/api/utilizadores` - Gestão de utilizadores
- `/api/tarefas` - Gestão de tarefas
- `/api/atribuicoes` - Gestão de atribuições

### Níveis de Acesso
1. **Gerente**
   - Criação e atribuição de tarefas
   - Visualização apenas das tarefas que criou

2. **Líder**
   - Gestão de tarefas da equipa
   - Atribuição de tarefas
   - Monitorização de progresso

3. **Programador**
   - Visualização e atualização de tarefas atribuídas
   - Atualização de estado de tarefas
   - Gestão de competências pessoais
  
4. **Admin**
   - Gestão completa de utilizadores (criar, editar, eliminar)
   - Sem acesso às funcionalidades de tarefas
   - Interface dedicada de administração de utilizadores

### Funcionalidades Admin Específicas

#### Web App
- Menu de navegação lateral adaptado (sem acesso a tarefas)
- Página dedicada para gestão de utilizadores
- Interface de criação de novos utilizadores
- Sistema de edição e eliminação de utilizadores existentes
- Proteção de rotas para acesso exclusivo

#### Mobile App
- Navegação por separadores adaptada para administradores:
  - Dashboard (simplificado sem informações de tarefas)
  - Utilizadores (acesso à gestão de utilizadores)
  - Perfil (informações e definições pessoais)
- Ecrã completo de gestão de utilizadores com:
  - Listagem com pesquisa 
  - Criação de novos utilizadores
  - Edição de utilizadores existentes
  - Eliminação de utilizadores

### Arquitetura
- Frontend React com gestão de estado contextual
- API RESTful com Express.js
- Autenticação JWT
- Base de dados MySQL
- Aplicação móvel React Native com navegação baseada em funções

Para visualizar a especificação OpenAPI 3.0.0 do projeto, aceda ao link:
https://editor.swagger.io

## Dependências Principais
Backend:
- express
- express-validator
- mysql2
- bcryptjs
- jsonwebtoken
- dotenv

Frontend:
- react
- react-router-dom
- axios
- react-bootstrap

Mobile:
- react-native
- @react-navigation
- react-native-paper
- @react-native-async-storage/async-storage
- axios

## Notas e Limitações Conhecidas

- **Permissões de Admin**: O utilizador admin não possui acesso às funcionalidades de tarefas, tanto na web como na aplicação móvel.
- **API e Permissões**: O backend possui verificações de permissão que podem restringir o acesso a determinados endpoints dependendo da função do utilizador.
- **Escalabilidade**: A aplicação foi projetada para fins educativos e pode necessitar de otimizações para utilização em ambientes de produção com muitos utilizadores.