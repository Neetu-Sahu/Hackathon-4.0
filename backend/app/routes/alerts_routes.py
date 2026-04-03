from fastapi import APIRouter

from app.services.analytics_service import build_anomaly_alerts, get_dashboard_metrics


router = APIRouter()


@router.get("/api/alerts/anomalies")
def alerts_anomalies():
    return {
        "success": True,
        "metrics": get_dashboard_metrics(),
        "alerts": build_anomaly_alerts(),
    }
