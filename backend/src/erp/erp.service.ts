import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Product } from '../products/product.entity';

@Injectable()
export class ErpService {
  async processPayment(product: Product, quantity: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 4000));

    if (product.name.includes('Cursed') || product.name.includes('Falha')) {
      throw new InternalServerErrorException(
        `ERP rejeitou o pagamento do produto: ${product.name}`,
      );
    }
  }
}
