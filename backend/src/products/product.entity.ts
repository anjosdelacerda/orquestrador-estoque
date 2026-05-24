import { Entity, PrimaryGeneratedColumn, Column, VersionColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column('int')
  priceInCents: number;

  @Column('int')
  stockQuantity: number;

  @VersionColumn()
  version: number;
}
