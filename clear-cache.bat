@echo off
REM Clear Cache Script for Tanfeez Project (Windows)
REM استخدم هذا السكريبت لمسح كل أنواع الكاش قبل الرفع على السيرفر

echo 🧹 Clearing all caches...

REM Remove dist folder
echo 📦 Removing dist folder...
if exist dist rmdir /s /q dist

REM Remove Vite cache
echo ⚡ Removing Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite

REM Remove TypeScript cache
echo 📘 Removing TypeScript cache...
if exist tsconfig.tsbuildinfo del /q tsconfig.tsbuildinfo
if exist tsconfig.app.tsbuildinfo del /q tsconfig.app.tsbuildinfo
if exist tsconfig.node.tsbuildinfo del /q tsconfig.node.tsbuildinfo

REM Remove any other cache folders
echo 🗑️  Removing other cache folders...
if exist .turbo rmdir /s /q .turbo
if exist .cache rmdir /s /q .cache

echo ✅ All caches cleared successfully!
echo 🚀 You can now run: npm run build

pause
