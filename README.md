# Orquestrador de Estoque — Lyncas

Stack: **NestJS** · **React + Vite** · **MySQL 8** · **Docker Compose** · **TypeORM** · **TanStack Query**

---

## Pré-requisitos

| Ferramenta     | Versão mínima                                         |
| -------------- | ----------------------------------------------------- |
| Docker         | 24+                                                   |
| Docker Compose | v2 (plugin)                                           |
| Node.js        | 20+ (apenas para npm workspaces / IntelliSense local) |

---

## Subir o projeto completo

Na raiz do repositório (`lyncas/`), execute:

```bash
docker compose up --build
```

O Docker Compose sobe os três containers **na ordem correta**, garantida por healthchecks reais:

```
db (MySQL 8)
  └─► backend (NestJS :3001)  — aguarda db saudável via mysqladmin ping
        └─► frontend (React/Vite :3000) — aguarda backend saudável via GET /api/status
```

Quando tudo estiver pronto, abra **http://localhost:3000** no browser.  
Você verá o painel de status confirmando que frontend, backend e banco estão operacionais.

---

## Endpoints do backend

| Método | Rota                | Descrição                                          |
| ------ | ------------------- | -------------------------------------------------- |
| GET    | `/api/status`       | Healthcheck — retorna estado do backend e do banco |
| GET    | `/api/products`     | Lista todos os produtos                            |
| POST   | `/api/products`     | Cria um produto                                    |
| GET    | `/api/products/:id` | Busca produto por UUID                             |
| PATCH  | `/api/products/:id` | Atualiza parcialmente um produto                   |
| DELETE | `/api/products/:id` | Remove um produto                                  |

**Payload de criação (`POST /api/products`):**

```json
{
  "nome": "Notebook Pro",
  "preco": 4999.9,
  "quantidade": 10
}
```

---

## Variáveis de ambiente

### `backend/.env`

```env
DB_HOST=db
DB_PORT=3306
DB_USER=fernando-lyncas
DB_PASSWORD=lyncas-pass
DB_NAME=orquestrador_estoque_db
PORT=3001
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3001
```

> **Nota:** o `VITE_API_URL` aponta para `localhost` porque é o _browser_ que faz as chamadas — não o container do frontend. O browser acessa a porta 3001 exposta pelo Docker na máquina host.

---

## npm Workspaces — IntelliSense sem instalar duas vezes

O `package.json` na raiz declara os dois pacotes como workspaces:

```json
{
  "workspaces": ["backend", "frontend"]
}
```

Com isso, basta um único comando na raiz para o VS Code reconhecer todas as tipagens TypeScript de ambas as aplicações:

```bash
# Rodar uma única vez, na pasta lyncas/
npm install
```

O npm criará um `node_modules/` na raiz com os pacotes de `backend` e `frontend` instalados e referenciados por symlinks. O VS Code e o Language Server do TypeScript usam automaticamente esse diretório para autocompletar importações, validar tipos e exibir erros inline — sem precisar abrir uma janela separada para cada subprojeto.

> **Os Dockerfiles instalam as dependências de forma independente** dentro de cada imagem (`npm install` dentro do container). O `node_modules/` local da raiz é apenas para suporte ao editor e **não** é montado nos containers.

---

## Estrutura de arquivos

```
lyncas/
├── docker-compose.yml
├── package.json          ← workspaces root
├── .gitignore
├── README.md
├── prompts.md
│
├── backend/
│   ├── Dockerfile
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── app.controller.ts
│       ├── app.service.ts
│       └── products/
│           ├── product.entity.ts
│           ├── products.module.ts
│           ├── products.controller.ts
│           ├── products.service.ts
│           └── dto/
│               ├── create-product.dto.ts
│               └── update-product.dto.ts
│
└── frontend/
    ├── Dockerfile
    ├── .env
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx      ← QueryClientProvider configurado aqui
        ├── App.tsx       ← useQuery → GET /api/status
        ├── App.css
        └── index.css
```

---

## Comandos úteis

```bash
# Subir em background
docker-compose up --build -d

# Ver logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f backend

# Parar e remover containers (mantém volume do banco)
docker-compose down

# Parar e remover containers + volume do banco (reset total)
docker-compose down -v
```
