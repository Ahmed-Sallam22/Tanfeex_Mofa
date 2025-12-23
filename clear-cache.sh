#!/bin/bash

# Clear Cache Script for Tanfeez Project
# استخدم هذا السكريبت لمسح كل أنواع الكاش قبل الرفع على السيرفر

echo "🧹 Clearing all caches..."

# Remove dist folder
echo "📦 Removing dist folder..."
rm -rf dist

# Remove Vite cache
echo "⚡ Removing Vite cache..."
rm -rf node_modules/.vite
rm -rf .vite

# Remove TypeScript cache
echo "📘 Removing TypeScript cache..."
rm -rf tsconfig.tsbuildinfo
rm -rf tsconfig.app.tsbuildinfo
rm -rf tsconfig.node.tsbuildinfo

# Remove any other cache folders
echo "🗑️  Removing other cache folders..."
rm -rf .turbo
rm -rf .cache

echo "✅ All caches cleared successfully!"
echo "🚀 You can now run: npm run build"
