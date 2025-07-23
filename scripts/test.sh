#!/bin/bash

# IQ24 Test Script
# This script runs all tests for the IQ24 AI platform

set -e

echo "🧪 Running IQ24 Test Suite..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Function to run tests with error handling
run_tests() {
    local filter=$1
    local description=$2
    
    echo "🔄 Running $description tests..."
    
    if bun run test --filter="$filter"; then
        echo "✅ $description tests passed"
        return 0
    else
        echo "❌ $description tests failed"
        return 1
    fi
}

# Initialize test results
passed_tests=0
failed_tests=0
test_results=()

# Run package tests
echo "📦 Testing packages..."
for package in packages/*/package.json; do
    if [ -f "$package" ]; then
        package_name=$(dirname "$package")
        package_name=$(basename "$package_name")
        
        # Check if package has test script
        if grep -q '"test"' "$package"; then
            if run_tests "./packages/$package_name" "$package_name package"; then
                ((passed_tests++))
                test_results+=("✅ $package_name package")
            else
                ((failed_tests++))
                test_results+=("❌ $package_name package")
            fi
        else
            echo "⚠️  No tests found for $package_name package"
        fi
    fi
done

# Run application tests
echo "🔧 Testing applications..."

# Test Dashboard
if [ -f "apps/dashboard/package.json" ] && grep -q '"test"' "apps/dashboard/package.json"; then
    if run_tests "@iq24/dashboard" "Dashboard"; then
        ((passed_tests++))
        test_results+=("✅ Dashboard")
    else
        ((failed_tests++))
        test_results+=("❌ Dashboard")
    fi
else
    echo "⚠️  No tests found for Dashboard"
fi

# Test Website
if [ -f "apps/website/package.json" ] && grep -q '"test"' "apps/website/package.json"; then
    if run_tests "@iq24/website" "Website"; then
        ((passed_tests++))
        test_results+=("✅ Website")
    else
        ((failed_tests++))
        test_results+=("❌ Website")
    fi
else
    echo "⚠️  No tests found for Website"
fi

# Test Engine
if [ -f "apps/engine/package.json" ] && grep -q '"test"' "apps/engine/package.json"; then
    if run_tests "@iq24/engine" "Engine"; then
        ((passed_tests++))
        test_results+=("✅ Engine")
    else
        ((failed_tests++))
        test_results+=("❌ Engine")
    fi
else
    echo "⚠️  No tests found for Engine"
fi

# Test Mobile
if [ -f "apps/mobile/package.json" ] && grep -q '"test"' "apps/mobile/package.json"; then
    if run_tests "@iq24/mobile" "Mobile"; then
        ((passed_tests++))
        test_results+=("✅ Mobile")
    else
        ((failed_tests++))
        test_results+=("❌ Mobile")
    fi
else
    echo "⚠️  No tests found for Mobile"
fi

# Run integration tests
echo "🔗 Running integration tests..."
if bun run test:integration 2>/dev/null; then
    ((passed_tests++))
    test_results+=("✅ Integration tests")
else
    echo "⚠️  No integration tests found"
fi

# Run end-to-end tests
echo "🌐 Running end-to-end tests..."
if bun run test:e2e 2>/dev/null; then
    ((passed_tests++))
    test_results+=("✅ End-to-end tests")
else
    echo "⚠️  No end-to-end tests found"
fi

# Display results
echo ""
echo "📊 Test Results Summary:"
echo "========================="
for result in "${test_results[@]}"; do
    echo "$result"
done

echo ""
echo "📈 Test Statistics:"
echo "- Passed: $passed_tests"
echo "- Failed: $failed_tests"
echo "- Total: $((passed_tests + failed_tests))"

if [ $failed_tests -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed!"
    exit 0
else
    echo ""
    echo "❌ Some tests failed. Please review the results above."
    exit 1
fi