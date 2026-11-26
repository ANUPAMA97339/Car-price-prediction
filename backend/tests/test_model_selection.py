from datetime import datetime, timezone
from app.models.database_models import ModelVersion
from app.ml.model_selection import update_model_versions


def test_update_writes_and_flags_active(test_db):
    report = {
        "split_name": "toy",
        "best_model": "random_forest",
        "all_models": {
            "linear_regression": {"mae": 100, "rmse": 200, "r2": 0.5, "mape": 10},
            "random_forest": {"mae": 50, "rmse": 100, "r2": 0.9, "mape": 5},
            "gradient_boosting": {"mae": 60, "rmse": 110, "r2": 0.88, "mape": 6},
            "xgboost": {"mae": 55, "rmse": 105, "r2": 0.89, "mape": 5.5},
        },
    }
    with test_db() as db:
        n = update_model_versions(db, [report])
        assert n == 4
        active = db.query(ModelVersion).filter(ModelVersion.is_active == 1).all()
        assert len(active) == 1
        assert active[0].model_name == "random_forest"
        assert active[0].model_version == "toy__random_forest"