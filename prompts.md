Atue como um Staff Software Engineer, Arquiteto de Soluções e especialista em DevOps. Você está inicializando um monorepo profissional chamado `lyncas` para um desafio técnico da TOTVS (CaseCellShop).

Stack:

- Monorepo com npm workspaces
- Backend: NestJS + TypeORM + MySQL 8
- Frontend: React + Vite + TypeScript + TanStack Query
- Docker Compose para orquestração completa

Objetivo:
Gerar toda a estrutura inicial do projeto já preparada para ambiente realista de desenvolvimento com MIGRATIONS AUTOMATIZADAS via TypeORM, sem uso de `synchronize: true`.

======================================================================
REQUISITOS DE ARQUITETURA
======================================================================

Estrutura:

- /backend
- /frontend
- package.json na raiz com workspaces
- docker-compose.yml na raiz
- README.md
- prompts.md
- .gitignore

======================================================================
DOCKER E ORQUESTRAÇÃO
======================================================================

O docker-compose deve subir 3 serviços:

- db (MySQL 8)
- backend
- frontend

Portas:

- frontend: 3000
- backend: 3001
- mysql: 3307

Regras obrigatórias:

- NÃO usar credenciais hardcoded
- NÃO usar env_file
- Todas as variáveis devem ser explicitamente declaradas no `environment:` usando `${VAR}`

Healthchecks obrigatórios:

- db → mysqladmin ping
- backend → GET /api/status
- frontend depende do backend saudável

======================================================================
REGRA CRÍTICA DO CICLO DE VIDA
======================================================================

O fluxo do `docker compose up --build` DEVE ser:

1. Subir MySQL
2. Esperar MySQL ficar healthy
3. Subir backend
4. Backend executar automaticamente:
   - `npm run migration:run`
5. Somente após migrations concluírem:
   - executar `npm run start:dev`
6. Frontend sobe apenas após backend healthy

IMPORTANTE:
Se eu executar:

- `docker compose down -v`
- depois `docker compose up --build`

O banco deve nascer automaticamente já com as tabelas criadas pelas migrations, sem qualquer ação manual.

======================================================================
BACKEND (NESTJS + TYPEORM)
======================================================================

Configurar:

- TypeORM com `synchronize: false`
- ConfigService lendo variáveis de ambiente
- arquivo isolado:
  - `src/database/data-source.ts`
- CLI do TypeORM funcional

Adicionar scripts:

- typeorm
- migration:generate
- migration:run
- migration:revert

Criar:

- entidade `Product`
- tabela `products`

Campos:

- id (uuid v4)
- name (string)
- price (decimal)
- qtd (int)

Criar:

- migration inicial em:
  - `src/database/migrations`

Criar:

- CRUD básico da entidade
- rota:
  - `GET /api/status`

A rota deve validar conexão ativa com banco e retornar JSON de sucesso.

======================================================================
FRONTEND
======================================================================

Configurar:

- React + Vite + TypeScript
- TanStack Query

Tela inicial:

- consumir `GET /api/status`
- exibir mensagem de sucesso quando backend/db estiverem operacionais

======================================================================
ENVIRONMENTS
======================================================================

Criar:

- /.env
- /.env.example
- /backend/.env
- /backend/.env.example
- /frontend/.env
- /frontend/.env.example

Todos sem valores reais.

Variáveis necessárias:

- MYSQL_ROOT_PASSWORD
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- BACKEND_PORT
- VITE_API_URL

======================================================================
GITIGNORE
======================================================================

Garantir que `.env` reais nunca sejam commitados, mas `.env.example` sejam permitidos.

======================================================================
ENTREGA
======================================================================

- Gere todos os arquivos completos
- Escreva código pronto para execução
- Não explique teoria
- Não resuma
- Não omita arquivos importantes
- Não use pseudocódigo
- Não use synchronize
- Não invente credenciais
- Não deixar etapas manuais para migrations

O projeto deve subir funcional apenas com:

- preencher .env
- `docker compose up --build`
