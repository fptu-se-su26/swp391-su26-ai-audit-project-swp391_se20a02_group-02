#!/bin/bash
set -e

echo "=== [1/5] System Update and Dependencies ==="
apt-get update -y
apt-get install -y git curl

echo "=== [2/5] Installing Docker ==="
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi
apt-get install -y docker-compose-plugin

echo "=== [3/5] Cloning / Updating Repository ==="
cd /opt
REPO_URL="https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a02_group-02.git"

if [ ! -d "luxeway" ]; then
    git clone "$REPO_URL" luxeway
    cd luxeway
else
    cd luxeway
    git reset --hard
    git remote set-url origin "$REPO_URL"
    git pull origin main
fi

echo "=== [4/5] Configuring Environment ==="
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

IP_ADDR="160.191.164.132"
DOMAIN="https://luxeway.io.vn"

# Update critical env vars (use sed to replace existing values)
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=$DOMAIN|g" .env
sed -i "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=$DOMAIN,http://$IP_ADDR:5173,http://$IP_ADDR,http://localhost:5173|g" .env

# Frontend uses relative URLs via nginx proxy - ensure these are set correctly
sed -i '/^VITE_API_URL=/d' .env
sed -i '/^VITE_AUTH_API_URL=/d' .env
echo "VITE_API_URL=/api/v1" >> .env
echo "VITE_AUTH_API_URL=" >> .env

# Goong map key
grep -q "^VITE_GOONG_MAPTILES_KEY=" .env && sed -i "s|^VITE_GOONG_MAPTILES_KEY=.*|VITE_GOONG_MAPTILES_KEY=MVEHK6ZSSm1tgi7DxoTpSctPEDPufxYYYf0NOmJ3|g" .env || echo "VITE_GOONG_MAPTILES_KEY=MVEHK6ZSSm1tgi7DxoTpSctPEDPufxYYYf0NOmJ3" >> .env

# Firebase config
grep -q "^VITE_FIREBASE_API_KEY=" .env || echo "VITE_FIREBASE_API_KEY=AIzaSyAzPoXzUJdFammfpf6acc4Oxr3xEfV3v5A" >> .env
grep -q "^VITE_FIREBASE_AUTH_DOMAIN=" .env || echo "VITE_FIREBASE_AUTH_DOMAIN=luxeway-4add3.firebaseapp.com" >> .env
grep -q "^VITE_FIREBASE_PROJECT_ID=" .env || echo "VITE_FIREBASE_PROJECT_ID=luxeway-4add3" >> .env
grep -q "^VITE_FIREBASE_MESSAGING_SENDER_ID=" .env || echo "VITE_FIREBASE_MESSAGING_SENDER_ID=167557599901" >> .env
grep -q "^VITE_FIREBASE_APP_ID=" .env || echo "VITE_FIREBASE_APP_ID=1:167557599901:web:8620b719b942660de7ba74" >> .env

# Google OAuth
grep -q "^VITE_GOOGLE_CLIENT_ID=" .env || echo "VITE_GOOGLE_CLIENT_ID=847311755277-hkm959nlmjee42aiccr313pah9mtokd2.apps.googleusercontent.com" >> .env
grep -q "^VITE_GOOGLE_REDIRECT_URI=" .env || echo "VITE_GOOGLE_REDIRECT_URI=$DOMAIN/auth/google/success" >> .env
sed -i "s|^VITE_GOOGLE_REDIRECT_URI=.*|VITE_GOOGLE_REDIRECT_URI=$DOMAIN/auth/google/success|g" .env

echo "=== [5/5] Starting Docker Compose (This will take a few minutes) ==="
docker compose down || true
docker compose up -d --build

echo ""
echo "=========================================================="
echo "  DEPLOYMENT COMPLETED!"
echo "  Frontend: http://$IP_ADDR (and port 5173)"
echo "  Backend API: http://$IP_ADDR:8080/api/v1"
echo "  Swagger UI: http://$IP_ADDR:8080/swagger-ui/index.html"
echo "=========================================================="
