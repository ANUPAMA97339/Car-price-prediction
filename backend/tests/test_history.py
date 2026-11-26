from app.models.database_models import Prediction


def _make_prediction(session):
    p = Prediction(
        vehicle_type="new", country="India", brand="Maruti", model="Swift",
        manufacturing_year=2024, original_currency="INR",
        predicted_price=750000.0, model_version="v1",
    )
    session.add(p)
    session.commit()
    session.refresh(p)
    return p


def test_history_list_and_delete(client, test_db):
    with test_db() as db:
        p = _make_prediction(db)
        pid = p.id

    r = client.get("/api/history")
    assert r.status_code == 200
    body = r.json()
    assert body["total"] >= 1
    assert any(item["id"] == pid for item in body["items"])

    r2 = client.delete(f"/api/history/{pid}")
    assert r2.status_code == 200

    r3 = client.delete(f"/api/history/{pid}")
    assert r3.status_code == 404


def test_compare_normalises_currencies(client):
    payload = {
        "items": [
            {"vehicle_type": "new", "country": "India", "brand": "A", "model": "B",
             "manufacturing_year": 2024, "original_currency": "INR", "predicted_price": 1000000},
            {"vehicle_type": "new", "country": "USA", "brand": "C", "model": "D",
             "manufacturing_year": 2024, "original_currency": "USD", "predicted_price": 25000},
        ]
    }
    r = client.post("/api/compare", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert "min_usd" in body["differences_usd"]
    assert body["differences_usd"]["spread_usd"] >= 0