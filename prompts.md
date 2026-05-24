###Prompt 1:

Atue como um Staff Software Engineer, Arquiteto de Soluções e especialista em DevOps. Você está inicializando um monorepo profissional chamado orquestrador-estoque.

Stack:

Monorepo com npm workspaces

Backend: NestJS + TypeORM + MySQL 8

Frontend: React + Vite + TypeScript + TanStack Query + Axios

Docker Compose para orquestração completa

Objetivo:
Gerar toda a estrutura inicial do projeto já preparada para ambiente realista de desenvolvimento com MIGRATIONS AUTOMATIZADAS via TypeORM, sem uso de synchronize: true, contendo a modelagem completa do fluxo de checkout e tratamento de resiliência. NÃO crie scripts de seed para popular o banco de dados.

REQUISITOS DE ARQUITETURA E DOCKER
O docker-compose deve subir 3 serviços: db (MySQL 8), backend (porta 3001) e frontend (porta 3000).

Regras obrigatórias:

NÃO usar credenciais hardcoded nem env_file. Variáveis no compose via ${VAR}.

Healthchecks obrigatórios: db (mysqladmin ping), backend (GET /api/status).

O fluxo do docker compose up --build DEVE ser:

Subir MySQL e esperar ficar healthy.

Subir backend e executar automaticamente npm run migration:run.

Somente após migrations concluírem, executar npm run start:dev.

Frontend sobe apenas após backend healthy.

Se eu derrubar os volumes e subir de novo, o banco deve nascer com todas as tabelas prontas sem ação manual.

BACKEND (NESTJS + TYPEORM) - MODELAGEM DE DADOS
Configurar TypeORM com synchronize: false e CLI funcional (migration:generate, run, revert).

Crie as seguintes entidades e gere a MIGRATION INICIAL criando as duas tabelas:

Entidade Product:

id (uuid v4)

name (string)

priceInCents (int)

stockQuantity (int, default 0)

image (string)

version (@VersionColumn para controle de concorrência otimista)

timestamps (createdAt, updatedAt)

Enum OrderStatus: PENDING, PROCESSING, COMPLETED, FAILED.

Entidade CheckoutAttempt:

id (uuid v4)

product (ManyToOne com Product)

requestedQuantity (int)

totalValueInCents (int)

status (enum OrderStatus, default PENDING)

errorMessage (text, nullable)

timestamps

BACKEND - REGRAS DE NEGÓCIO (O DESAFIO)
Crie a rota GET /api/products que retorna todos os produtos.

Crie um ErpService (Mock do sistema legado):

Função processOrderInErp(productId: string, total: number): Promise<boolean>

Deve ter um setTimeout de 4 segundos para simular lentidão.

Regra hardcoded: Se o nome do produto contiver a palavra "Cursed" ou "Falha", a promise deve dar reject com erro "Timeout no ERP". Caso contrário, resolve true.

Crie a rota POST /api/checkout recebendo productId e quantity. O fluxo DEVE ser:

Criar e salvar um CheckoutAttempt com status PROCESSING.

Buscar o produto. Se quantity > stockQuantity, atualiza attempt para FAILED ("Sem estoque") e retorna 400.

Se houver estoque, subtrair a quantidade do Product e salvar no banco (reservando o estoque e usando a constraint da @VersionColumn).

Chamar o ErpService.processOrderInErp. Envolva em um try/catch.

Se SUCESSO: atualiza attempt para COMPLETED e retorna 200 OK.

Se ERRO (catch): Atualiza attempt para FAILED com a mensagem de erro. DEVOLVE a quantity para o stockQuantity do Product (Rollback manual) e retorna 502 Bad Gateway.

FRONTEND (REACT + VITE)
Crie uma interface limpa que consuma a API:

Tela principal listando os produtos em um Grid (buscando do GET /api/products).

Cada Card de produto deve exibir: Imagem, Nome, Preço (formatado de centavos para Real).

O Card deve ter um input numérico para quantidade e um botão "Comprar".

Ao clicar em comprar:

Disparar o POST /api/checkout.

O botão deve ficar em estado de "Loading..." (desabilitado) para evitar duplo clique durante os 4 segundos de demora do ERP.

Exibir um alerta (toast ou mensagem na tela) de SUCESSO ou ERRO com base na resposta do backend.

Fazer refetch na query de produtos para atualizar o estoque na tela.

ENTREGA E ENVIRONMENTS
Gere arquivos .env.example na raiz, no frontend e no backend.

Escreva o código completo, sem omitir funções, imports ou decorators.

Gere o arquivo de MIGRATION já com as queries DDL (CREATE TABLE) para products e checkout_attempts.

Não deixe etapas manuais para gerar migrations.

### prompt 2

Atue como um Staff Software Engineer. Na Fase 1, concluímos o setup da infraestrutura do monorepo orquestrador-estoque. O Docker já sobe o MySQL, o backend (NestJS) e o frontend (React), e as entidades primárias (Product e CheckoutAttempt) já estão criadas via TypeORM.

Nesta Fase 2, vamos evoluir o projeto implementando o fluxo de checkout, a integração com o sistema legado (Mock do ERP) e a interface da vitrine para o usuário.

Siga este plano de execução:

======================================================================

# DOCKER E REDE (EVOLUÇÃO)

Para garantir a comunicação perfeita entre os containers e a execução do ciclo de vida:

No docker-compose.yml, defina uma network explícita (ex: app-network) e coloque os 3 serviços nela.

Atualize o command do backend para rodar as migrations de forma automatizada antes de levantar a API: command: sh -c "npm run migration:run && npm run start:dev"

====================================================================== 2. BACKEND - EVOLUÇÃO DAS ENTIDADES
Vamos adicionar rastreabilidade de tempo, padrão em sistemas transacionais:

Na entidade Product, adicione @CreateDateColumn() e @UpdateDateColumn().

Na entidade CheckoutAttempt, adicione @CreateDateColumn(), @UpdateDateColumn() e a coluna de foreign key explícita @Column() productId: string;.

Gere uma nova migration (ex: AddTimestampsAndFk) refletindo essas adições.

====================================================================== 3. BACKEND - FLUXO DE CHECKOUT E ERP
Crie o módulo, controller e services para o domínio de Checkout:

ErpService: Crie o mock de integração com o ERP.

Função: processOrderInErp(productId: string, productName: string, total: number): Promise<boolean>.

Comportamento: Use setTimeout de 4 segundos. Se o productName contiver "Cursed" ou "Falha", a promise deve dar reject('Timeout no ERP'). Caso contrário, resolve(true).

CheckoutService: Implemente o método processCheckout(productId: string, quantity: number). O fluxo atômico deve ser:

Salvar um CheckoutAttempt com status PENDING.

Buscar o produto. Se quantity > stockQuantity, falhar (HTTP 400) e marcar attempt como FAILED.

Mudar attempt para PROCESSING. Subtrair a quantidade do Product e salvar no banco.

Enviar para o ErpService.processOrderInErp dentro de um try/catch.

Sucesso: Marcar attempt como COMPLETED e retornar HTTP 200.

Falha (catch): Marcar attempt como FAILED com o erro do ERP. Fazer o rollback no banco (devolver a quantity pro Product) e retornar HTTP 502.

CheckoutController: Crie a rota POST /api/checkout para acionar o serviço.

====================================================================== 4. FRONTEND - VITRINE (REACT + VITE)
Substitua a tela inicial genérica pela vitrine de produtos da CaseCellShop:

Configuração: Instale e configure o Axios (api.ts) e o TanStack Query (QueryClientProvider no main.tsx).

ProductGrid: Componente principal que usa useQuery para dar GET em /api/products. Renderize os estados de loading e error.

ProductCard:

Exiba a image, name e priceInCents (divida por 100 para formatar em Reais).

Adicione um <input type="number"> (mínimo 1) para a quantidade.

Adicione o botão "Comprar".

Fluxo de Compra: Ao clicar em Comprar:

Dispare o POST /api/checkout via Axios.

Altere o botão para estado de "Processando..." e disabled (evitando duplo clique durante a espera do ERP).

Finalizada a requisição, exiba um alerta nativo ou Toast informando sucesso ou o erro exato retornado.

Dispare um refetch do TanStack Query para atualizar o estoque na tela imediatamente.

Entregue o código completo dos arquivos criados/alterados.

### prompt 3

siga as diretrizes do arquivo CLAUDE.md

Atue como um Desenvolvedor Backend Senior (NestJS/TypeScript).
Sua tarefa é implementar a lógica de checkout do nosso sistema, focado em alta concorrência. As entidades `CheckoutAttempt` e `Product` (com `@VersionColumn`) já existem.

Crie/modifique os seguintes arquivos:

1. `src/erp/erp.service.ts` e `erp.module.ts`: Crie um mock do ERP Central. O método `processPayment` deve ter um delay de 4 segundos. Se o nome do produto contiver a palavra "Cursed" ou "Falha", lance uma exceção. Caso contrário, retorne sucesso.
2. `src/checkout/dto/create-checkout.dto.ts`: Crie o DTO recebendo `productId` (string) e `quantity` (number, min: 1). Use class-validator.
3. `src/checkout/checkout.service.ts`: Implemente o método de checkout. O fluxo DEVE ser:
   - Validar se o produto existe (lançar NotFoundException 404).
   - Validar se há estoque suficiente (lançar BadRequestException 400).
   - Criar `CheckoutAttempt` com status `PENDING`.
   - Deduzir o estoque e salvar (o `@VersionColumn` fará o Optimistic Locking).
   - Mudar status para `PROCESSING`.
   - Chamar o `ErpService`.
   - Se o ErpService retornar sucesso: Mudar status para `COMPLETED` e retornar HTTP 200.
   - Se o ErpService falhar: Fazer o ROLLBACK MANUAL (devolver a quantidade ao estoque do produto), mudar status para `FAILED` e lançar BadGatewayException 502.
4. `src/checkout/checkout.controller.ts`: Crie o endpoint POST `/api/checkout` chamando o serviço.
5. Garanta que os módulos (`checkout.module.ts` e `app.module.ts`) estejam exportando e importando os providers corretamente.

Escreva código limpo, tipado e sem comentários redundantes. Pode começar.

### prompt 4

Atue como um QA/Engenheiro de Software Especialista em Testes (NestJS/Jest/Supertest).
Acabamos de implementar o fluxo de `/api/checkout`. Escreva o arquivo de testes E2E em `src/checkout/tests/checkout.e2e.spec.ts`.

Eu preciso que você implemente exatamente estes 5 cenários:

1. Sucesso: Produto existe, estoque suficiente. Esperado HTTP 200, status `COMPLETED` e estoque reduzido.
2. Estoque Insuficiente: Tenta comprar quantidade maior que o estoque. Esperado HTTP 400, status `FAILED` e estoque intacto.
3. Produto Não Existe: ID inválido. Esperado HTTP 404.
4. ERP Falha (Rollback): Produto com nome "Cursed". O ErpService vai falhar. Esperado HTTP 502, e o estoque DEVE ser restaurado ao valor original.
5. Quantidade Inválida: Tenta enviar quantity <= 0. Esperado HTTP 400 pelo class-validator.

Configure o módulo de testes criando produtos mockados no banco em memória antes de cada teste para garantir isolamento. Foque no código e na asserção correta dos HTTP status codes.Atue como um QA/Engenheiro de Software Especialista em Testes (NestJS/Jest/Supertest).
Acabamos de implementar o fluxo de `/api/checkout`. Escreva o arquivo de testes E2E em `src/checkout/tests/checkout.e2e.spec.ts`.

Eu preciso que você implemente exatamente estes 5 cenários:

1. Sucesso: Produto existe, estoque suficiente. Esperado HTTP 200, status `COMPLETED` e estoque reduzido.
2. Estoque Insuficiente: Tenta comprar quantidade maior que o estoque. Esperado HTTP 400, status `FAILED` e estoque intacto.
3. Produto Não Existe: ID inválido. Esperado HTTP 404.
4. ERP Falha (Rollback): Produto com nome "Cursed". O ErpService vai falhar. Esperado HTTP 502, e o estoque DEVE ser restaurado ao valor original.
5. Quantidade Inválida: Tenta enviar quantity <= 0. Esperado HTTP 400 pelo class-validator.

Configure o módulo de testes criando produtos mockados no banco em memória antes de cada teste para garantir isolamento. Foque no código e na asserção correta dos HTTP status codes.

### prompt 4

Atue como um Desenvolvedor Frontend React Senior (TypeScript/TanStack Query/Material-UI).
Sua tarefa é construir a tela de Checkout da Parte 1.B do desafio técnico para a CaseCellShop. O backend expõe `GET /api/products` e `POST /api/checkout`.

A arquitetura deve seguir um modelo Layered + Feature-based simplificado: `src/services`, `src/app/components` e `src/app/views`. O estado do servidor será gerenciado pelo TanStack Query. Use Material-UI (@mui/material) para a interface, adotando uma abordagem mobile-first que lembre uma vitrine de e-commerce.

Crie/modifique os arquivos abaixo seguindo estritamente estas regras:

1. `frontend/src/services/api.ts`: Instância do Axios.
2. `frontend/src/services/checkoutService.ts`: Hooks `useProducts` (Query) e `useCheckout` (Mutation com refetch no onSuccess).
3. `frontend/src/app/components/NavBar/index.tsx`: AppBar preto fosco com o nome 'CaseCellShop'. Use `position="fixed"` para fixar no topo.
4. `frontend/src/app/components/ProductCatalog/index.tsx`:
   - Envolva tudo em um Container com `minHeight="100vh"` e margem superior para compensar a Navbar fixa.
   - Crie um campo de busca local (`TextField` + `useState`) que filtra os produtos.
   - Vitrine: `<Grid container spacing={3}>` (1 coluna no mobile, 3 no desktop). O Grid deve manter o alinhamento à esquerda.
   - Cards: No map, renderize um `Card`. OBRIGATÓRIO: O card deve ter `width: '100%'` e um `minWidth` razoável (ex: 280px) para não espremer a UI quando o filtro retornar apenas 1 produto.
   - Imagem: `CardMedia` com altura fixa (~200px) e `objectFit: 'contain'`.
   - Texto: Trunque o nome do produto se passar de 30 caracteres (adicione "...") e envolva em um `<Tooltip>` para mostrar o nome completo no hover. Exiba preço em BRL (convertido de centavos).
   - Botão 'Comprar' posicionado no rodapé (`flexGrow: 1` no CardContent).
5. `frontend/src/app/components/CheckoutModal/index.tsx`:
   - Modal acionado pelo botão 'Comprar'. Exibe input de quantidade e calcula valor total dinamicamente.
   - Estado Padrão: Botões "Cancelar" (`variant="contained"`, `color="error"` para fundo vermelho e texto branco) e "Confirmar compra". Durante `isPending`, bloqueie tudo e mostre spinner.
   - Estado de Sucesso: Remova os botões de Cancelar/Confirmar. Mostre apenas um `<Alert>` de sucesso contendo um span/link escrito "Continue comprando" que fecha o modal.
   - Estado de Erro: Remova os botões de Cancelar/Confirmar. Mostre apenas um `<Alert>` com a mensagem do backend, a frase "Tente novamente mais tarde" e um span/link escrito "Home" que fecha o modal. NÃO duplique o link "Home" fora do Alert.
   - Reset de Estado: Qualquer ação que feche o modal (backdrop, Cancelar, Home ou Continue comprando) DEVE obrigatoriamente limpar o input de quantidade e limpar o termo de busca da vitrine (`setSearchTerm('')`), garantindo que o usuário volte para o catálogo completo.
6. `frontend/src/app/views/CheckoutPage/index.tsx`: Agrupa NavBar e ProductCatalog.

Ao final da implementação, adicione comentários curtos no código nos pontos onde `useState`, `useEffect` e `useRef` foram utilizados, explicando o motivo arquitetural do seu uso nesta tela. Foque em código limpo e tipagem rigorosa. Pode começar.
