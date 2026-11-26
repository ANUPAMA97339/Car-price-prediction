# Global Car Price Prediction AI

An open-source, AI-powered web application that predicts new and used car prices across multiple countries using machine learning trained on real market datasets.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Node](https://img.shields.io/badge/node-%E2%89%A518-green)

## Features

- 🤖 **Real ML predictions** — Linear Regression, Random Forest, Gradient Boosting, XGBoost
- 🌍 **Multi-country support** — India (INR), USA (USD), and growing
- 📊 **Live analytics** — Real aggregated stats from actual predictions
- 📄 **PDF reports** — Powered by ReportLab, no paid APIs
- 🕘 **Prediction history** — Stored locally in SQLite
- 🔐 **No login required** — All features accessible instantly
- 🎨 **Premium dark UI** — Responsive React + Tailwind dashboard
- 🐳 **Docker-ready** — One command to run the whole stack

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2, SQLite |
| ML | scikit-learn, XGBoost, pandas, NumPy, matplotlib |
| Reports | ReportLab |
| Deployment | Docker, Docker Compose, Nginx |

## Quick Start (Local)

### Prerequisites

- **macOS:** `brew install python@3.12 node git libomp`
- **Kali Linux ARM64:** `sudo apt install python3.12 python3.12-venv python3-pip nodejs npm git libomp-dev`

### One-time setup

```bash
git clone <your-repo-url> global-car-price-ai
cd global-car-price-ai
chmod +x scripts/*.sh scripts/*.py
./scripts/setup.sh
```

### Download datasets (manual)

See [`backend/data/README.md`](backend/data/README.md). Quick summary:

1. Kaggle → [CarDekho vehicle dataset](https://www.kaggle.com/datasets/nehalbirla/vehicle-dataset-from-cardekho) → save as `backend/data/raw/cardekho/used_cars.csv` and `new_cars.csv`
2. Kaggle → [Craigslist vehicles](https://www.kaggle.com/datasets/austinreese/craigslist-carstrucks-data) → save as `backend/data/raw/craigslist/vehicles.csv`

### Prepare data & train

```bash
cd backend
source venv/bin/activate
python scripts/prepare_data.py
python scripts/train_models.py
python scripts/evaluate_models.py
```

### Run

Terminal 1 (backend):
```bash
cd backend && source venv/bin/activate && uvicorn app.main:app --reload
```

Terminal 2 (frontend):
```bash
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend docs: http://127.0.0.1:8000/docs

## Docker Quick Start

```bash
docker compose -f deployment/docker-compose.yml up --build
```

Frontend: http://localhost:5173 — Backend: http://localhost:8000

## Project Structure

```
global-car-price-ai/
├── backend/          # FastAPI + ML + SQLite
├── frontend/         # React + Vite + Tailwind
├── docs/             # Architecture, API, ML methodology
├── scripts/          # Setup, data prep, training
├── deployment/       # Docker + Nginx
└── .github/          # CI workflows
```

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api_documentation.md)
- [Datasets](docs/dataset_documentation.md)
- [ML Methodology](docs/ml_methodology.md)
- [Installation](docs/installation.md)
- [User Manual](docs/user_manual.md)

## Known Limitations

- **Coverage:** India (new + used) and USA (used). Europe pending dataset download.
- **`used_inr`:** Trained on ~283 rows — **low reliability**, warning shown to users.
- **Prediction ranges** are MAE-based, not statistical confidence intervals.
- **No real-time currency conversion** — a documented static snapshot is used (2025-01-01).
- **No login** — History is per-server. Do not use in multi-tenant production without adding auth.

## License

MIT — see [LICENSE](LICENSE)