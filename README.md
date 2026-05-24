# Orquestrador de Estoque — Lyncas

Vitrine de produtos com fluxo de checkout integrado a um mock de ERP externo.
Desenvolvido como desafio técnico Full Stack (Júnior).

---

## Pré-requisitos

| Ferramenta     | Versão mínima                                       |
| -------------- | --------------------------------------------------- |
| Docker         | 20.10+ com Compose v2 (recomendado: 24+)            |
| Docker Compose | v2 (plugin integrado ao Docker)                     |
| Node.js        | 20+ (opcional — apenas para IntelliSense no editor) |

### Por que Docker Compose v2 é obrigatório?

O `docker-compose.yml` usa `depends_on.condition: service_healthy` para garantir que cada container só sobe depois que o anterior está saudável:

```
db → (healthcheck OK) → backend → (healthcheck OK) → frontend
```

Essa funcionalidade **só existe no Docker Compose v2** (plugin em Go). O docker-compose v1 (Python, standalone) **ignora silenciosamente** a condição `service_healthy` em arquivos de formato v3 — os containers sobem todos ao mesmo tempo, sem esperar, e o backend tenta conectar ao banco antes de ele estar pronto.

### Qual comando usar?

| Situação                                       | Comando                   |
| ---------------------------------------------- | ------------------------- |
| Docker 20.10+ com Compose v2 (plugin)          | `docker compose` (padrão) |
| Docker antigo com docker-compose v1 standalone | `docker-compose`          |

> Para verificar qual versão você tem:
> ```bash
> docker compose version   # v2 — deve retornar "Docker Compose version v2.x.x"
> docker-compose --version # v1 — retorna "docker-compose version 1.x.x"
> ```

### Tenho Docker antigo. Como rodar?

Se você só tem o docker-compose v1 (sem suporte a healthcheck ordering), suba os serviços **manualmente na ordem correta**, aguardando cada etapa:

```bash
# 1. Sobe apenas o banco e aguarda estar pronto
docker-compose up -d db
# Aguarde ~15-30 segundos para o MySQL inicializar

# 2. Sobe o backend
docker-compose up -d backend
# Aguarde ~30 segundos para as migrations rodarem

# 3. Sobe o frontend
docker-compose up -d frontend
```

> A forma mais simples de resolver definitivamente é instalar o plugin do Compose v2:
> ```bash
> # Linux
> sudo apt-get install docker-compose-plugin
> # Após instalar, use: docker compose (sem hífen)
> ```

---

## Tecnologias utilizadas

### Backend
- **NestJS 10** — framework Node.js para APIs REST
- **TypeORM 0.3** — ORM com migrations e entities
- **MySQL 8** — banco de dados relacional
- **class-validator / class-transformer** — validação de DTOs
- **Axios** — cliente HTTP para comunicação com o ERP

### Frontend
- **React 18** + **Vite 5** — SPA moderna com HMR
- **TypeScript 5** — tipagem estática em todo o projeto
- **TanStack Query (React Query) v5** — cache e estado de servidor
- **Material UI 5** — componentes de interface
- **Axios** — chamadas HTTP ao backend

### Infraestrutura
- **Docker** + **Docker Compose v2** — orquestração de containers
- **MySQL 8.0 (container)** — banco isolado por ambiente

### Testes
- **Jest** + **Supertest** — testes E2E do backend
- **SQLite (in-memory)** — banco em memória usado nos testes automatizados

### Desenvolvimento assistido por IA
- **Claude Code (Anthropic)** — assistente de IA utilizado durante o desenvolvimento para scaffolding, revisão de código e documentação

---

## Configuração dos arquivos `.env`

O projeto utiliza variáveis de ambiente em **três locais distintos**. Antes de qualquer outro passo, crie os três arquivos `.env` baseando-se nos respectivos `.env.example`.

### 1. Raiz do projeto (`/.env`)

Contém as credenciais do MySQL usadas pelo Docker Compose para criar o banco de dados.
O banco será criado com exatamente os valores que você definir aqui.

```bash
cp .env.example .env
```

Edite o `.env` criado e preencha todos os campos:

```env
# .env.example (raiz)
MYSQL_ROOT_PASSWORD=   # senha do usuário root do MySQL
MYSQL_USER=            # usuário do banco criado para a aplicação
MYSQL_PASSWORD=        # senha desse usuário
MYSQL_DATABASE=        # nome do banco de dados

DB_HOST=db
DB_PORT=3306
DB_USER=               # mesmo valor de MYSQL_USER
DB_PASSWORD=           # mesmo valor de MYSQL_PASSWORD
DB_NAME=               # mesmo valor de MYSQL_DATABASE
BACKEND_PORT=3001

VITE_API_URL=http://localhost:3001
```

### 2. Backend (`/backend/.env`)

Usadas pelo NestJS para conectar ao banco.

```bash
cp backend/.env.example backend/.env
```

```env
# backend/.env.example
DB_HOST=db
DB_PORT=3306
DB_USER=        # mesmo valor de MYSQL_USER
DB_PASSWORD=    # mesmo valor de MYSQL_PASSWORD
DB_NAME=        # mesmo valor de MYSQL_DATABASE
PORT=3001
```

### 3. Frontend (`/frontend/.env`)

Usada pelo Vite para apontar para o backend.

```bash
cp frontend/.env.example frontend/.env
```

```env
# frontend/.env.example
VITE_API_URL=http://localhost:3001
```

> **Por que `localhost` e não o nome do container?**
> O `VITE_API_URL` é embutido no bundle estático no momento do build. As chamadas são feitas pelo **browser do usuário**, não pelo container do frontend — por isso deve apontar para `localhost:3001` (porta exposta pelo Docker na máquina host).

---

## Subir o projeto

Com os três `.env` criados e preenchidos, execute na raiz do repositório:

```bash
docker compose up --build
```

> Se você tiver docker-compose v1 (sem suporte a healthcheck ordering), consulte a seção **"Tenho Docker antigo. Como rodar?"** nos pré-requisitos.

O Docker Compose sobe os três containers **na ordem correta**, garantida por healthchecks reais:

```
db (MySQL 8)
  └─► backend (NestJS :3001)  — aguarda db via mysqladmin ping
        └─► frontend (React/Vite :3000) — aguarda backend via GET /api/status
```

Quando tudo estiver pronto, acesse **http://localhost:3000** no browser.

---

## Comportamento do mock de ERP — teste intencional

O backend inclui um **mock de ERP externo** que simula a integração com um sistema de pagamento real.

### Como testar o comportamento de erro

Na barra de busca da vitrine, pesquise por produtos com as palavras:

- **`Cursed`**
- **`Falha`**

Ao tentar fazer o checkout de qualquer produto com esses nomes, o mock do ERP simulará um **erro de timeout/rejeição**, retornando um erro `500` do backend.

Esse comportamento é **intencional** e faz parte do desafio técnico — o objetivo é demonstrar o tratamento de erros de integração com sistemas externos (ERP).

> Os produtos "Capa Silicone iPhone 14 Verde **Cursed**" e "Capa Translúcida Galaxy S23 FE **Falha**" já estão incluídos no seed do banco.

---

## Endpoints do backend

| Método | Rota                      | Descrição                                          |
| ------ | ------------------------- | -------------------------------------------------- |
| GET    | `/api/status`             | Healthcheck — estado do backend e do banco         |
| GET    | `/api/products`           | Lista todos os produtos                            |
| POST   | `/api/products`           | Cria um produto                                    |
| GET    | `/api/products/:id`       | Busca produto por UUID                             |
| PATCH  | `/api/products/:id`       | Atualiza parcialmente um produto                   |
| DELETE | `/api/products/:id`       | Remove um produto                                  |
| POST   | `/api/checkout`           | Processa o checkout de um produto                  |

---

## Comandos úteis

```bash
# Subir em background (sem travar o terminal)
docker compose up --build -d

# Ver logs em tempo real
docker compose logs -f

# Logs de um serviço específico
docker compose logs -f backend

# Parar e remover containers (mantém volume do banco)
docker compose down

# Reset total — apaga containers e volume do banco
docker compose down -v
```

---

## Estrutura de arquivos

```
lyncas/
├── docker-compose.yml
├── .env.example          ← copie para .env e preencha
├── package.json          ← workspaces root (IntelliSense local)
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── .env.example      ← copie para .env e preencha
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── checkout/     ← fluxo de checkout + integração ERP
│       ├── erp/          ← mock do ERP externo
│       ├── products/     ← CRUD de produtos
│       └── database/
│           ├── migrations/
│           └── seeds/    ← dados iniciais (inclui produtos Cursed/Falha)
│
└── frontend/
    ├── Dockerfile
    ├── .env.example      ← copie para .env e preencha
    └── src/
        ├── app/
        │   ├── components/   ← CheckoutForm, CheckoutModal, Navbar, ProductCard
        │   └── views/        ← StorePage, CheckoutPage
        └── services/         ← api.ts, checkoutService.ts
```

---

## npm Workspaces — IntelliSense sem instalar duas vezes

Para ter autocompletar e validação de tipos no editor sem precisar instalar dependências manualmente em cada subprojeto, execute **uma única vez** na raiz:

```bash
npm install
```

> Os Dockerfiles instalam as dependências de forma independente dentro de cada imagem. O `node_modules/` local é apenas para suporte ao editor e **não** é montado nos containers.
