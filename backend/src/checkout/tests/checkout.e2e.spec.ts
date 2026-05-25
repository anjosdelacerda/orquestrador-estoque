import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule, getRepositoryToken } from "@nestjs/typeorm";
import request from "supertest";
import { Repository } from "typeorm";

import { CheckoutAttempt } from "../checkout-attempt.entity";
import { CheckoutModule } from "../checkout.module";
import { OrderStatus } from "../enums/order-status.enum";
import { ErpService } from "../../erp/erp.service";
import { Product } from "../../products/product.entity";

describe("POST /api/checkout (E2E)", () => {
  let app: INestApplication;
  let productRepo: Repository<Product>;
  let checkoutRepo: Repository<CheckoutAttempt>;

  const mockErpService = {
    processPayment: jest.fn().mockImplementation(async (product: Product) => {
      if (product.name.includes("Cursed") || product.name.includes("Falha")) {
        throw new Error(`ERP rejeitou o pagamento do produto: ${product.name}`);
      }
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "better-sqlite3",
          database: ":memory:",
          entities: [Product, CheckoutAttempt],
          synchronize: true,
        }),
        CheckoutModule,
      ],
    })
      .overrideProvider(ErpService)
      .useValue(mockErpService)
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    checkoutRepo = module.get<Repository<CheckoutAttempt>>(
      getRepositoryToken(CheckoutAttempt),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await checkoutRepo.clear();
    await productRepo.clear();
    mockErpService.processPayment.mockClear();
  });

  async function createProduct(
    overrides: Partial<Product> = {},
  ): Promise<Product> {
    return productRepo.save(
      productRepo.create({
        name: "Produto Normal",
        image: "img.png",
        priceInCents: 5000,
        stockQuantity: 10,
        ...overrides,
      }),
    );
  }

  it("cenário 1: sucesso → HTTP 200, status COMPLETED, estoque reduzido", async () => {
    const product = await createProduct({ stockQuantity: 10 });

    const res = await request(app.getHttpServer())
      .post("/api/checkout")
      .send({ productId: product.id, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(OrderStatus.COMPLETED);

    const updated = await productRepo.findOne({ where: { id: product.id } });
    expect(updated.stockQuantity).toBe(7);
  });

  it("cenário 2: estoque insuficiente → HTTP 400, estoque intacto", async () => {
    const product = await createProduct({ stockQuantity: 2 });

    const res = await request(app.getHttpServer())
      .post("/api/checkout")
      .send({ productId: product.id, quantity: 5 });

    expect(res.status).toBe(400);

    const unchanged = await productRepo.findOne({ where: { id: product.id } });
    expect(unchanged.stockQuantity).toBe(2);
  });

  it("cenário 3: produto não existe → HTTP 404", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/checkout")
      .send({ productId: "00000000-0000-0000-0000-000000000000", quantity: 1 });

    expect(res.status).toBe(404);
  });

  it("cenário 4: ERP falha (Cursed) → HTTP 502, estoque restaurado", async () => {
    const product = await createProduct({
      name: "Cursed Item",
      stockQuantity: 10,
    });

    const res = await request(app.getHttpServer())
      .post("/api/checkout")
      .send({ productId: product.id, quantity: 2 });

    expect(res.status).toBe(502);

    const restored = await productRepo.findOne({ where: { id: product.id } });
    expect(restored.stockQuantity).toBe(10);
  });

  it("cenário 5: quantity <= 0 → HTTP 400 (class-validator)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/checkout")
      .send({ productId: "qualquer-id", quantity: 0 });

    expect(res.status).toBe(400);
  });

  it("cenário 6: 3 requisições simultâneas com 1 unidade em estoque → apenas 1 sucesso, estoque nunca negativo", async () => {
    const product = await createProduct({ stockQuantity: 1 });

    const results = await Promise.all([
      request(app.getHttpServer())
        .post("/api/checkout")
        .send({ productId: product.id, quantity: 1 }),
      request(app.getHttpServer())
        .post("/api/checkout")
        .send({ productId: product.id, quantity: 1 }),
      request(app.getHttpServer())
        .post("/api/checkout")
        .send({ productId: product.id, quantity: 1 }),
    ]);

    const successes = results.filter((r) => r.status === 200);
    const failures = results.filter((r) => r.status !== 200);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(2);

    const final = await productRepo.findOne({ where: { id: product.id } });
    expect(final.stockQuantity).toBe(0);
    expect(final.stockQuantity).toBeGreaterThanOrEqual(0);
  });
});
