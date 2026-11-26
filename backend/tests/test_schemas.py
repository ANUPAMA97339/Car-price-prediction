import pytest
from pydantic import ValidationError
from app.schemas.vehicle import NewCarInput, UsedCarInput


def test_new_car_input_valid():
    obj = NewCarInput(
        country="India", brand="Maruti", model="Swift",
        manufacturing_year=2024, currency="INR",
    )
    assert obj.currency == "INR"


def test_new_car_lowercase_currency_upcased():
    obj = NewCarInput(
        country="USA", brand="Honda", model="Civic",
        manufacturing_year=2020, currency="usd",
    )
    assert obj.currency == "USD"


def test_invalid_currency_rejected():
    with pytest.raises(ValidationError):
        NewCarInput(
            country="India", brand="X", model="Y",
            manufacturing_year=2020, currency="XYZ",
        )


def test_year_out_of_range():
    with pytest.raises(ValidationError):
        UsedCarInput(
            country="India", brand="X", model="Y",
            manufacturing_year=1800, currency="INR", mileage=1000,
        )


def test_used_car_mileage_required():
    with pytest.raises(ValidationError):
        UsedCarInput(
            country="India", brand="X", model="Y",
            manufacturing_year=2020, currency="INR",
        )