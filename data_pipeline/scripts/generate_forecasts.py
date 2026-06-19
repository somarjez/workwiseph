from __future__ import annotations
from data_pipeline.forecast_pipeline import run_forecasts


if __name__ == "__main__":
    counts = run_forecasts()
    print("Forecast generation complete.")
    for k, v in counts.items():
        print(f"  {k:20s} {v:>5d}")
