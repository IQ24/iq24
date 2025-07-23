#!/bin/bash

# IQ24 Development Start Script
# This script starts the development environment with all services

set -e

echo "🚀 Starting IQ24 Development Environment..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Function to start a service in background
start_service() {
    local service=$1
    local port=$2
    local command=$3
    
    echo "🔄 Starting $service on port $port..."
    
    # Kill existing processes on the port
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is in use. Killing existing process..."
        kill -9 $(lsof -Pi :$port -sTCP:LISTEN -t) 2>/dev/null || true
    fi
    
    # Start the service
    eval "$command" &
    local pid=$!
    
    # Store PID for cleanup
    echo $pid > "tmp/${service}.pid"
    
    echo "✅ $service started with PID $pid"
}

# Create tmp directory for PIDs
mkdir -p tmp

# Start services
echo "🔧 Starting all services..."

# Start API (Supabase)
start_service "api" "54321" "cd apps/api && supabase start"

# Start Dashboard
start_service "dashboard" "3000" "cd apps/dashboard && bun run dev"

# Start Website
start_service "website" "3001" "cd apps/website && bun run dev"

# Start Engine
start_service "engine" "8787" "cd apps/engine && bun run dev"

# Start Documentation
start_service "docs" "3004" "cd apps/docs && mintlify dev --port 3004"

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "Available services:"
echo "- Dashboard: http://localhost:3000"
echo "- Website: http://localhost:3001"
echo "- API: http://localhost:54321"
echo "- Engine: http://localhost:8787"
echo "- Documentation: http://localhost:3004"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    
    # Kill all background processes
    for pidfile in tmp/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if kill -0 "$pid" 2>/dev/null; then
                echo "🔄 Stopping process $pid..."
                kill -TERM "$pid" 2>/dev/null || true
            fi
            rm -f "$pidfile"
        fi
    done
    
    # Kill processes by port
    for port in 3000 3001 3004 8787 54321; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "🔄 Stopping service on port $port..."
            kill -9 $(lsof -Pi :$port -sTCP:LISTEN -t) 2>/dev/null || true
        fi
    done
    
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait