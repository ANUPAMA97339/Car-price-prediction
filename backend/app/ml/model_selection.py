from __future__ import annotations

import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.database_models import ModelVersion

logger = logging.getLogger(__name__)


def update_model_versions(db: Session, reports: list[dict]) -> int:
    written = 0
    training_date = datetime.now(timezone.utc)

    for report in reports:
        split = report["split_name"]
        best_name = report["best_model"]

        for name, metrics in report["all_models"].items():
            version = f"{split}__{name}"
            existing = (
                db.query(ModelVersion)
                .filter(
                    ModelVersion.model_name == name,
                    ModelVersion.model_version == version,
                )
                .first()
            )
            values = dict(
                mae=metrics["mae"],
                rmse=metrics["rmse"],
                r2_score=metrics["r2"],
                mape=metrics["mape"],
                training_date=training_date,
                dataset_version=split,
                is_active=1 if name == best_name else 0,
            )
            if existing:
                for k, v in values.items():
                    setattr(existing, k, v)
            else:
                db.add(ModelVersion(
                    model_name=name,
                    model_version=version,
                    **values,
                ))
            written += 1

    db.commit()
    logger.info("Wrote %d model_versions rows", written)
    return written
