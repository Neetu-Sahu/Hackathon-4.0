from __future__ import annotations

import math
from typing import Any

import pandas as pd

from app.services.data_service import load_district_data
from app.services.scoring_service import calculate_priority_score


def _safe_float(value: Any) -> float:
    try:
        if value is None or (isinstance(value, float) and math.isnan(value)):
            return 0.0
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _z_score(value: float, series: pd.Series) -> float:
    std = float(series.std(ddof=0) or 0.0)
    if std == 0:
        return 0.0
    return (value - float(series.mean())) / std


def build_anomaly_alerts() -> list[dict[str, Any]]:
    df = load_district_data()
    scored_df = calculate_priority_score(df.copy())

    literacy_series = scored_df["literacy_rate"]
    population_series = scored_df["population"]
    gender_ratio_series = scored_df["gender_ratio"] if "gender_ratio" in scored_df.columns else None
    literacy_index_series = scored_df["literacy_index"] if "literacy_index" in scored_df.columns else None
    priority_series = scored_df["priority_score"]

    alerts: list[dict[str, Any]] = []

    for _, row in scored_df.iterrows():
        literacy_rate = _safe_float(row.get("literacy_rate"))
        population = _safe_float(row.get("population"))
        gender_ratio = _safe_float(row.get("gender_ratio"))
        literacy_index = _safe_float(row.get("literacy_index"))
        priority_score = _safe_float(row.get("priority_score"))

        district_alerts: list[dict[str, Any]] = []

        literacy_z = _z_score(literacy_rate, literacy_series)
        population_z = _z_score(population, population_series)
        priority_z = _z_score(priority_score, priority_series)

        if literacy_rate < 60 or literacy_z <= -1.0:
            district_alerts.append(
                {
                    "type": "performance",
                    "metric": "literacy_rate",
                    "severity": "high" if literacy_rate < 50 or literacy_z <= -1.6 else "medium",
                    "title": "Low literacy performance",
                    "detail": (
                        f"Literacy rate is {literacy_rate:.2f}% "
                        f"({abs(literacy_z):.2f} standard deviations below the district average)."
                    ),
                }
            )

        if literacy_index_series is not None:
            literacy_index_z = _z_score(literacy_index, literacy_index_series)
            if literacy_index_z <= -1.0:
                district_alerts.append(
                    {
                        "type": "performance",
                        "metric": "literacy_index",
                        "severity": "medium",
                        "title": "Weak literacy index",
                        "detail": (
                            f"Literacy index is {literacy_index:.2f}, which is unusually low "
                            f"compared with the rest of the dataset."
                        ),
                    }
                )

        if population_z >= 1.25 or population >= float(population_series.quantile(0.9)):
            district_alerts.append(
                {
                    "type": "pressure",
                    "metric": "population",
                    "severity": "medium" if population_z < 1.8 else "high",
                    "title": "High population pressure",
                    "detail": (
                        f"Population is {int(population):,}, placing the district in the upper tail "
                        f"of the dataset."
                    ),
                }
            )

        if gender_ratio_series is not None and (gender_ratio < 900 or gender_ratio > 1050):
            district_alerts.append(
                {
                    "type": "equity",
                    "metric": "gender_ratio",
                    "severity": "medium",
                    "title": "Gender ratio imbalance",
                    "detail": (
                        f"Gender ratio is {gender_ratio:.0f}, which suggests a demographic imbalance "
                        f"worth reviewing."
                    ),
                }
            )

        if priority_z >= 1.25:
            district_alerts.append(
                {
                    "type": "risk",
                    "metric": "priority_score",
                    "severity": "high",
                    "title": "Priority outlier",
                    "detail": (
                        f"Priority score is {priority_score:.2f}, well above the district average and "
                        f"flagged as a high-risk outlier."
                    ),
                }
            )

        for alert in district_alerts:
            alerts.append(
                {
                    "district": row.get("district"),
                    "state": row.get("state"),
                    "priority_score": round(priority_score, 2),
                    **alert,
                }
            )

    alerts.sort(key=lambda item: ({"high": 0, "medium": 1, "low": 2}.get(item["severity"], 3), -item["priority_score"]))
    return alerts


def get_dashboard_metrics() -> dict[str, Any]:
    df = load_district_data()
    scored_df = calculate_priority_score(df.copy())

    return {
        "total_districts": int(len(scored_df)),
        "avg_literacy_rate": round(float(scored_df["literacy_rate"].mean()), 2),
        "avg_priority_score": round(float(scored_df["priority_score"].mean()), 2),
        "high_alert_districts": int(
            sum(1 for alert in build_anomaly_alerts() if alert["severity"] == "high")
        ),
    }
