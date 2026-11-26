import pytest


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["version"] == "1.0.0"


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "message" in r.json()


def test_overview_empty(client):
    r = client.get("/api/analytics/overview")
    assert r.status_code == 200
    body = r.json()
    assert body["total_predictions"] == 0


def test_model_performance_empty(client):
    r = client.get("/api/model/performance")
    assert r.status_code == 200
    assert "active_model" in r.json()


@pytest.mark.skip(reason="Requires trained artifacts to be absent; Phase 5+ has models.")
def test_predictions_return_503_when_untrained(client):
    pass


def test_currency_validation(client):
    bad = {
        "country": "India", "brand": "Maruti", "model": "Swift",
        "manufacturing_year": 2024, "currency": "XYZ",
        "body_type": "Hatchback",
    }
    r = client.post("/api/predictions/new", json=bad)
    assert r.status_code == 422