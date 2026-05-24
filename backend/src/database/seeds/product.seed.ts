import { Repository } from "typeorm";
import { Product } from "../../products/product.entity";

const PRODUCTS: Partial<Product>[] = [
  {
    name: "Capa Silicone iPhone 14 Verde Cursed",
    image:
      "https://m.media-amazon.com/images/I/51Mmc+VdRML.AC_SY300_SX300_QL70_ML2.jpg",
    priceInCents: 4990,
    stockQuantity: 42,
  },
  {
    name: "Capa Translúcida Galaxy S23 FE Falha",
    image: "https://m.media-amazon.com/images/I/41w3F+VgvAL.AC_SX522.jpg",
    priceInCents: 3490,
    stockQuantity: 35,
  },
  {
    name: "Capa Ultra Slim Galaxy A17 Preta",
    image: "https://m.media-amazon.com/images/I/616GuXuB+3L.AC_SX522.jpg",
    priceInCents: 2990,
    stockQuantity: 50,
  },
  {
    name: "Capa Flexível Galaxy S20 Ultra Rosa",
    image: "https://m.media-amazon.com/images/I/41jnyltUvyL.AC_SX522.jpg",
    priceInCents: 3990,
    stockQuantity: 28,
  },
  {
    name: "Capa Magnética MagSafe iPhone 14",
    image: "https://m.media-amazon.com/images/I/71BeQrOY9XL.AC_SX522.jpg",
    priceInCents: 8990,
    stockQuantity: 15,
  },
  {
    name: "Capa Flexível Galaxy S22 Plus Azul",
    image: "https://m.media-amazon.com/images/I/514P7A3HogL.AC_SX522.jpg",
    priceInCents: 4490,
    stockQuantity: 22,
  },
];

export async function seedProducts(repo: Repository<Product>): Promise<void> {
  const count = await repo.count();
  if (count > 0) return;

  const entities = repo.create(PRODUCTS as Product[]);
  await repo.save(entities);
}
