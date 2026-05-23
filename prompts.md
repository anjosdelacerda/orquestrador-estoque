###inicialização do projeto

Atue como um Engenheiro de Software Sênior e Especialista em arquitetura limpa. Estou na pasta raiz vazia chamada "lyncas". Seu objetivo é criar a estrutura inicial automatizada, segura e componentizada do projeto "orquestrador de estoque" utilizando Docker Compose, NestJS, React e MySQL.

Escreva todos os arquivos de código, configurações e infraestrutura diretamente no meu workspace seguindo as instruções abaixo de segurança, arquitetura e legibilidade:

1. ARQUITETURA DE PASTAS E WORKSPACES (RAIZ)

- Raiz (/lyncas): Deve conter o 'docker-compose.yml', '.gitignore', 'README.md', 'prompts.md' e um 'package.json' configurado com "workspaces": ["backend", "frontend"] para permitir que eu rode um único "npm install" na raiz para o Intellisense do VS Code reconhecer tudo de uma vez.
- /backend: Aplicação NestJS completa com TypeScript e TypeORM (estrutura modular padrão). Deve conter seu próprio Dockerfile.
- /frontend: Aplicação React completa com TypeScript e React Query (TanStack Query) integrado. Deve conter seu próprio Dockerfile.

2. SEGURANÇA E DECLARAÇÃO INLINE DE VARIÁVEIS (DOCKER COMPOSE)

- O 'docker-compose.yml' na raiz deve gerenciar 3 containers: 'db' (MySQL 8), 'backend' e 'frontend'.
- Mapeie as portas: 3000 (frontend), 3001 (backend) e 3306 (MySQL).
- PROIBIDO: Não coloque nenhuma credencial hardcoded e NÃO use a diretiva 'env_file' geral que esconde as variáveis.
- OBRIGATÓRIO: Use DECLARAÇÃO INLINE EXPLÍCITA na propriedade 'environment' de cada serviço, mapeando as variáveis a partir do ambiente da raiz usando a sintaxe ${VARIAVEL}. Quem ler o compose deve saber exatamente o que o container consome (ex: MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}), mantendo o arquivo transparente, mas sem expor valores reais.
- Configure healthchecks reais: o 'backend' só inicia após o 'db' estar totalmente 'healthy' via mysqladmin; o 'frontend' só inicia após o 'backend' estar 'healthy' (testando o endpoint '/api/status').

3. BANCO DE DADOS E BACKEND (NESTJS)

- No NestJS, configure o TypeORM para ler as variáveis de ambiente através do ConfigService do Nest e ative o 'synchronize: true'.
- Crie uma Entidade 'Product' (tabela 'products') usando UUID v4 como chave primária, contendo: id (uuid), nome (string), preco (decimal/float) e quantidade (int). Crie o CRUD básico funcional (Module, Controller, Service, Entity).
- Crie uma rota de healthcheck simplificada 'GET /api/status' que testa a conexão ativa com o banco de dados e retorna um JSON de sucesso.

4. CONFIGURAÇÃO DO FRONTEND (REACT)

- Configure o React Query no 'main.tsx' ou 'App.tsx'.
- Na tela inicial, use o 'useQuery' para disparar uma requisição para 'GET /api/status' do backend (usando a variável de URL da API).
- Se a requisição for bem-sucedida, exiba um painel moderno com a mensagem: "Docker executado com sucesso! Container do Frontend Conectado ao Backend, Banco de Dados Inicializado. Pronto para iniciar a codificação do checkout."

5. ESTRUTURA DE ARQUIVOS .ENV E TEMPLATES (SEM VALORES REAIS)
   Você deve criar a árvore de arquivos de ambiente com os campos necessários, mas todos os valores devem vir TOTALMENTE VAZIOS ou com placeholders genéricos (ex: seu_usuario_aqui). Eu irei preenchê-los manualmente antes de subir o ambiente.

Crie exatamente os seguintes arquivos:

- '/.env.example' (RAIZ): Template com todas as variáveis que o docker-compose precisa ler da raiz (MYSQL_ROOT_PASSWORD, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, BACKEND_PORT, VITE_API_URL).
- '/.env' (RAIZ): Cópia exata do arquivo acima, mas com os valores em branco para eu preencher.
- '/backend/.env.example' e '/backend/.env': Contendo as chaves locais do NestJS (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, PORT). Valores em branco.
- '/frontend/.env.example' e '/frontend/.env': Contendo a chave local do Vite (VITE_API_URL). Valores em branco.

6. ATUALIZAÇÃO DO .GITIGNORE (RAIZ)
   O arquivo '/.gitignore' na raiz do projeto deve garantir de forma recursiva que nenhum arquivo '.env' real seja trackeado pelo Git, mas permitindo explicitamente os arquivos de exemplo. Adicione as seguintes regras exatas:
   **/ .env
   **/ .env.local
   !\*\*/ .env.example

7. DOCUMENTAÇÃO E INSTRUÇÕES DE BOOTSTRAP

- Crie um 'README.md' explicando que o projeto utiliza variáveis de ambiente seguras.
- Deixe Explícito no passo a passo que o desenvolvedor DEVE abrir os arquivos '.env' criados (na raiz, backend e frontend), preencher as credenciais desejadas para o banco e portas, e SÓ DEPOIS disso executar o comando "docker-compose up --build".
- Adicione a instrução de rodar "npm install" na raiz para habilitar o suporte a Workspaces do npm no VS Code.
- Crie um arquivo 'prompts.md' registrando o histórico de escopo deste setup.

Gere e injete toda a estrutura de arquivos e códigos-fonte diretamente no meu workspace agora.
