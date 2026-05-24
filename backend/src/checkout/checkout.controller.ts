import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @HttpCode(200)
  checkout(@Body() dto: CreateCheckoutDto) {
    return this.checkoutService.checkout(dto);
  }
}
