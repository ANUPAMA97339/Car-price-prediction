import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from app.database.connection import Base  # noqa: E402
from app.models import database_models  # noqa: F401,E402
from app.database.session import get_db  # noqa: E402
from app.main import app as fastapi_app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture()
def test_db(tmp_path):
    db_path = tmp_path / "test.sqlite"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    yield TestingSession
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(test_db):
    def override():
        db = test_db()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override
    with TestClient(fastapi_app) as c:
        yield c
    fastapi_app.dependency_overrides.clear()