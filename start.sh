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

echo "Running Prisma migrations (deploy)..."
npx prisma@5.20.0 migrate deploy

echo "Building app..."
npm run build

echo "Starting app on port ${PORT:-3000}..."
PORT="${PORT:-3000}" npm run start
