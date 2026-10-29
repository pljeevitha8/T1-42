#!/bin/bash
echo "========================================================"
echo "  Launching SketchTrace AI Forensic Reconstruction Suite"
echo "========================================================"
echo ""
cd server
if [ ! -d "node_modules" ]; then
    echo "[INFO] First-time setup: Installing backend dependencies..."
    npm install --omit=dev
fi
echo "[INFO] Starting full-stack server on http://localhost:5000..."
node dist/index.js
