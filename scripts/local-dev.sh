#!/bin/bash

# Local Development Setup Script
# This script sets up the LexiScan development environment

set -e

echo "🚀 Setting up LexiScan development environment..."

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed. Please install Python 3.11+"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose"
        exit 1
    fi
    
    echo "✅ All requirements met!"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install app dependencies
    echo "Installing web app dependencies..."
    cd apps/web && npm install && cd ../..
    
    echo "Installing API dependencies..."
    cd apps/api && npm install && cd ../..
    
    echo "Installing dashboard dependencies..."
    cd apps/dashboard && npm install && cd ../..
    
    # Install package dependencies
    echo "Installing shared types..."
    cd packages/shared-types && npm install && cd ../..
    
    echo "Installing UI package..."
    cd packages/ui && npm install && cd ../..
    
    echo "Installing clients package..."
    cd packages/clients && npm install && cd ../..
    
    # Install Python dependencies
    echo "Installing AI worker dependencies..."
    cd services/ai-worker && pip install -r requirements.txt && cd ../..
    
    echo "Installing PDF generator dependencies..."
    cd services/pdf-generator && pip install -r requirements.txt && cd ../..
    
    echo "✅ Dependencies installed!"
}

# Setup environment
setup_environment() {
    echo "🔧 Setting up environment..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        echo "📝 Created .env file from template. Please update with your configuration."
    else
        echo "✅ .env file already exists"
    fi
}

# Setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    # Start PostgreSQL and Redis
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    echo "Waiting for services to be ready..."
    sleep 10
    
    # Run database migrations
    cd apps/api
    npx prisma migrate dev --name init
    npx prisma generate
    cd ../..
    
    echo "✅ Database setup complete!"
}

# Build packages
build_packages() {
    echo "🔨 Building packages..."
    
    cd packages/shared-types && npm run build && cd ../..
    cd packages/ui && npm run build && cd ../..
    cd packages/clients && npm run build && cd ../..
    
    echo "✅ Packages built!"
}

# Start development servers
start_dev_servers() {
    echo "🚀 Starting development servers..."
    
    echo "Starting services with Docker Compose..."
    docker-compose up -d
    
    echo ""
    echo "🎉 Development environment is ready!"
    echo ""
    echo "📱 Access your applications:"
    echo "   Web App:      http://localhost:3000"
    echo "   Dashboard:     http://localhost:3002"
    echo "   API Docs:     http://localhost:3001/api/docs"
    echo "   AI Worker:    http://localhost:8000/docs"
    echo "   PDF Generator: http://localhost:8001/docs"
    echo ""
    echo "💡 To start individual services manually:"
    echo "   API:          cd apps/api && npm run start:dev"
    echo "   Web:          cd apps/web && npm run dev"
    echo "   Dashboard:    cd apps/dashboard && npm run dev"
    echo "   AI Worker:    cd services/ai-worker && python main.py"
    echo "   PDF Generator: cd services/pdf-generator && python main.py"
    echo ""
}

# Main execution
main() {
    check_requirements
    install_dependencies
    setup_environment
    setup_database
    build_packages
    start_dev_servers
}

# Run main function
main "$@"
