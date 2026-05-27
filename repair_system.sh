#!/bin/bash

# Sorzal System Repair & Cleanup Script
# This script requires sudo privileges.

echo "[CLEANUP] Starting temporary file cleanup..."

# 1. Clean old MongoDB logs
if [ -d /var/log/mongodb ]; then
    echo "  - Cleaning MongoDB logs..."
    sudo find /var/log/mongodb -type f -name "*.log.*" -delete
    sudo truncate -s 0 /var/log/mongodb/*.log 2>/dev/null
fi

# 2. Clean systemd journal (limit to 100MB)
echo "  - Cleaning systemd journal..."
sudo journalctl --vacuum-size=100M

# 3. Clean package cache (Arch Linux / pacman)
if command -v pacman &> /dev/null; then
    echo "  - Cleaning pacman cache..."
    sudo pacman -Sc --noconfirm
fi

# 4. Clean /tmp (with caution)
echo "  - Cleaning /tmp directory..."
sudo find /tmp -atime +1 -type f -delete

echo "[FIX] Correcting MongoDB permissions and configuration..."

# 5. Ensure MongoDB directories
sudo mkdir -p /var/lib/mongodb/Sorzal
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chmod -R 755 /var/lib/mongodb

# 6. Correct log permissions
sudo touch /var/log/mongodb/Sorzal.log
sudo chown mongodb:mongodb /var/log/mongodb/Sorzal.log

# 7. Restart the service
echo "[RESTART] Restarting MongoDB service..."
sudo systemctl daemon-reload
# Note: Using the generic mongodb service or the custom one if configured
if systemctl list-unit-files | grep -q "mongod-Sorzal.service"; then
    sudo systemctl restart mongod-Sorzal
else
    sudo systemctl restart mongodb
fi

echo "[SUCCESS] Repair completed. Check status with: systemctl status mongodb"
