#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Setting up Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
[ -f .env ] || cp .env.example .env
deactivate

echo "==> Setting up Frontend..."
cd ../frontend
[ -f .env ] || cp .env.example .env
npm install

cd "$ROOT"
echo "==> Setup complete."
