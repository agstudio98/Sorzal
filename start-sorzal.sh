#!/bin/bash

# Sorzal Project Starter - Robust Mode
echo "[SYSTEM] Starting Sorzal Ecosystem..."

# 1. Ensure data directory exists
mkdir -p BackEnd/db_data

# 2. Check and Start MongoDB on port 27020
if lsof -Pi :27020 -sTCP:LISTEN -t >/dev/null ; then
    echo "[SYSTEM] MongoDB is already running on port 27020."
else
    echo "[SYSTEM] Starting local MongoDB instance on port 27020..."
    # Using --fork requires --logpath
    mongod --dbpath BackEnd/db_data --port 27020 --logpath BackEnd/db_data/mongod.log --nounixsocket --fork
    
    if [ $? -eq 0 ]; then
        echo "[SYSTEM] MongoDB started successfully."
    else
        echo "[ERROR] Failed to start MongoDB. Please check if mongod is installed and available in PATH."
        echo "[HINT] You might need to run: sudo systemctl start mongod-Sorzal (if using system service)"
    fi
fi

# 3. Start the Backend
echo "[SYSTEM] Starting Backend..."
cd BackEnd && npm run dev
