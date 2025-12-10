@echo off
echo Clearing Next.js caches...
rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul
echo Cache cleared!
echo Restart your dev server now
pause
