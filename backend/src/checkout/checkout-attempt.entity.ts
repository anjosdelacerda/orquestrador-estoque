import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { OrderStatus } from './enums/order-status.enum';

@Entity('checkout_attempts')
export class CheckoutAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { nullable: false, eager: false })
  product: Product;

  @Column('int')
  requestedQuantity: number;

  @Column('int')
  totalValueInCents: number;

  @Column({ type: 'simple-enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;
}
