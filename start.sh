#!/usr/bin/env sh
set -eu

APP_DIR="dekes-saas"

if [ ! -d "$APP_DIR" ]; then
  echo "Expected app directory '$APP_DIR' not found in $(pwd)"
  ls -la
  exit 1
fi

cd "$APP_DIR"

echo "Installing dependencies..."
npm ci

echo "Generating Prisma client..."
npx prisma@5.20.0 generate

echo "Running Prisma migrations (deploy)..."
npx prisma@5.20.0 migrate deploy || {
  echo "Migration deploy failed, attempting db push as fallback..."
  npx prisma@5.20.0 db push --accept-data-loss
}

echo "Building app..."
npm run build

echo "Starting app on port ${PORT:-3000}..."
PORT="${PORT:-3000}" npm run start
