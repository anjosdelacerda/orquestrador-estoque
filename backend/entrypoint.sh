#!/bin/sh
set -e

echo "▶ Running TypeORM migrations..."
npm run migration:run

echo "▶ Starting NestJS..."
exec npm run start:dev
