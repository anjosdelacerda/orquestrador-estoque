import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getStatus() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        backend: 'active',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'degraded',
        backend: 'active',
        database: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
