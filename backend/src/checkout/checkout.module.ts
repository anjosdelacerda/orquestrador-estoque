import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutAttempt } from './checkout-attempt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckoutAttempt])],
  exports: [TypeOrmModule],
})
export class CheckoutModule {}
