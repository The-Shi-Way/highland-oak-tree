#!/bin/sh
set -e

echo "Running database migrations..."
npx typeorm migration:run -d server-nestjs/dist/database/data-source.js
echo "Migrations complete."

echo "Starting server..."
exec node server-nestjs/dist/main
