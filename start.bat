@echo off
echo ========================================================
echo   Launching SketchTrace AI Forensic Reconstruction Suite
echo ========================================================
echo.
cd server
if not exist node_modules (
    echo [INFO] First-time setup: Installing backend dependencies...
    cmd /c "npm install --omit=dev"
)
echo [INFO] Starting full-stack server on http://localhost:5000...
node dist/index.js
pause
