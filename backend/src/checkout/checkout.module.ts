import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutAttempt } from './checkout-attempt.entity';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { Product } from '../products/product.entity';
import { ErpModule } from '../erp/erp.module';

@Module({
  imports: [TypeOrmModule.forFeature([CheckoutAttempt, Product]), ErpModule],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
