Atue como um Engenheiro de Software Sênior e Especialista em arquitetura limpa. Estou na pasta raiz vazia chamada "lyncas". Seu objetivo é criar a estrutura inicial automatizada, segura e componentizada do projeto "orquestrador de estoque" utilizando Docker Compose, NestJS, React e MySQL.

Escreva todos os arquivos de código, configurações e infraestrutura diretamente no meu workspace seguindo as instruções abaixo de segurança, arquitetura e legibilidade:

1. ARQUITETURA DE PASTAS E WORKSPACES (RAIZ)

Raiz (/lyncas): Deve conter o docker-compose.yml, .gitignore, README.md, prompts.md e um package.json configurado com "workspaces": ["backend", "frontend"] para permitir que eu rode um único npm install na raiz para o Intellisense do VS Code reconhecer tudo de uma vez.

/backend: Aplicação NestJS completa com TypeScript e TypeORM. Deve conter seu próprio Dockerfile.

/frontend: Aplicação React completa com Vite, TypeScript e React Query (TanStack Query) integrado. Deve conter seu próprio Dockerfile.

2. SEGURANÇA, DOCKER COMPOSE E CICLO DE VIDA

O docker-compose.yml na raiz deve gerenciar 3 containers: db (MySQL 8), backend e frontend.

Mapeie as portas: 3000 (frontend), 3001 (backend) e 3306 (MySQL).

PROIBIDO: Não coloque nenhuma credencial hardcoded e NÃO use a diretiva env_file geral que esconde as variáveis.

OBRIGATÓRIO: Use DECLARAÇÃO INLINE EXPLÍCITA na propriedade environment de cada serviço, mapeando as variáveis a partir do ambiente da raiz usando a sintaxe ${VARIAVEL}.

Configure healthchecks reais: o backend só inicia após o db estar totalmente 'healthy' via mysqladmin; o frontend só inicia após o backend estar 'healthy' (testando o endpoint /api/status).

OBRIGATÓRIO (Ciclo de Vida): O Dockerfile do backend (ou a instrução command no docker-compose) DEVE executar as migrations antes de subir o servidor NestJS. Exemplo de comando: npm run migration:run && npm run start:dev.

3. BANCO DE DADOS, MIGRATIONS E BACKEND (NESTJS)

No NestJS, configure o TypeORM com synchronize: false. O controle do banco DEVE ser feito exclusivamente por migrations.

Crie um arquivo src/database/data-source.ts isolado. Ele deve ler as variáveis de ambiente (via dotenv) e ser configurado para uso da CLI do TypeORM.

Adicione os scripts da CLI do TypeORM no package.json do backend (ex: typeorm, migration:generate, migration:run).

Crie a Entidade Product (tabela products) contendo: id (uuid v4), name (string), price (decimal/float) e qtd (int).

Crie e inclua o arquivo da Migration Inicial (1600000000000-CreateProductsTable.ts na pasta src/database/migrations) para criar a tabela products com esses campos.

Crie o CRUD básico funcional da entidade (Module, Controller, Service).

Crie uma rota de healthcheck simplificada GET /api/status que testa a conexão ativa com o banco de dados e retorna um JSON de sucesso.

4. CONFIGURAÇÃO DO FRONTEND (REACT)

Configure o React Query no main.tsx ou App.tsx.

Na tela inicial, use o useQuery para disparar uma requisição para GET /api/status do backend (usando a variável de URL da API).

Se a requisição for bem-sucedida, exiba um painel com a mensagem: "Docker executado com sucesso! Migrations rodaram, Banco de Dados Inicializado e Frontend Conectado. Pronto para iniciar a codificação do checkout."

5. ESTRUTURA DE ARQUIVOS .ENV E TEMPLATES
   Crie a árvore de arquivos de ambiente, mas todos os valores devem vir TOTALMENTE VAZIOS ou com placeholders genéricos:

/.env.example (RAIZ): Template com todas as variáveis (MYSQL_ROOT_PASSWORD, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, BACKEND_PORT, VITE_API_URL).

/.env (RAIZ): Cópia exata do arquivo acima, com valores em branco.

/backend/.env.example e /backend/.env: Contendo as chaves locais do NestJS em branco.

/frontend/.env.example e /frontend/.env: Contendo a chave local do Vite em branco.

6. ATUALIZAÇÃO DO .GITIGNORE (RAIZ)
   Adicione as seguintes regras exatas para não commitar chaves reais:
   / .env
   / .env.local
   !/ .env.example

7. DOCUMENTAÇÃO E INSTRUÇÕES DE BOOTSTRAP

Crie um README.md explicando o setup. Deixe explícito que o desenvolvedor DEVE preencher os .env antes de rodar docker compose up --build.

Explique que, graças ao setup, o banco já nascerá com as tabelas prontas via migrations automatizadas no boot do container do backend.

Crie o arquivo prompts.md registrando este escopo.
