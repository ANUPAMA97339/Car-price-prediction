from app.database.connection import Base, engine
from app.models import database_models  # noqa: F401 — registers models


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def drop_all() -> None:
    Base.metadata.drop_all(bind=engine)