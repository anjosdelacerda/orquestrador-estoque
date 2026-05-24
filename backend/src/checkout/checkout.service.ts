import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckoutAttempt } from './checkout-attempt.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { OrderStatus } from './enums/order-status.enum';
import { Product } from '../products/product.entity';
import { ErpService } from '../erp/erp.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CheckoutAttempt)
    private readonly checkoutRepo: Repository<CheckoutAttempt>,
    private readonly erpService: ErpService,
  ) {}

  async checkout(dto: CreateCheckoutDto): Promise<CheckoutAttempt> {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Produto ${dto.productId} não encontrado.`);
    }

    if (product.stockQuantity < dto.quantity) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${product.stockQuantity}.`,
      );
    }

    const attempt = this.checkoutRepo.create({
      product,
      requestedQuantity: dto.quantity,
      totalValueInCents: product.priceInCents * dto.quantity,
      status: OrderStatus.PENDING,
    });
    await this.checkoutRepo.save(attempt);

    product.stockQuantity -= dto.quantity;
    await this.productRepo.save(product);

    attempt.status = OrderStatus.PROCESSING;
    await this.checkoutRepo.save(attempt);

    try {
      await this.erpService.processPayment(product, dto.quantity);
    } catch (error) {
      product.stockQuantity += dto.quantity;
      await this.productRepo.save(product);

      attempt.status = OrderStatus.FAILED;
      attempt.errorMessage = (error as Error).message;
      await this.checkoutRepo.save(attempt);

      throw new BadGatewayException(
        `Falha no processamento do ERP: ${(error as Error).message}`,
      );
    }

    attempt.status = OrderStatus.COMPLETED;
    return this.checkoutRepo.save(attempt);
  }
}
