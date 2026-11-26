# ML Methodology

## Datasets

See [dataset_documentation.md](dataset_documentation.md).

## Feature Engineering

**Numeric:** `manufacturing_year`, `vehicle_age`, `mileage`, `engine_capacity`
**Categorical:** `brand`, `country`, `fuel_type`, `transmission`, `vehicle_condition`

Target: `price` (in original currency).

## Preprocessing Pipeline

```python
ColumnTransformer([
  ("num", Pipeline([Imputer(median), StandardScaler()]), num_cols),
  ("cat", Pipeline([Imputer(most_frequent), OneHotEncoder(handle_unknown="ignore")]), cat_cols),
])