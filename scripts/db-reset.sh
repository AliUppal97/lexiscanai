#!/bin/bash

# Database Reset Script
# This script resets the database and runs migrations

set -e

echo "🗄️ Resetting LexiScan database..."

# Check if we're in the right directory
if [ ! -f "apps/api/prisma/schema.prisma" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Stop any running services
echo "🛑 Stopping services..."
docker-compose down

# Start PostgreSQL
echo "🚀 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Reset database
echo "🔄 Resetting database..."
cd apps/api

# Drop and recreate database
npx prisma migrate reset --force

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

cd ../..

echo "✅ Database reset complete!"
echo ""
echo "💡 You can now start the development servers:"
echo "   docker-compose up -d"
echo "   or"
echo "   npm run dev"
