from fastapi import APIRouter
from app.services.data_service import load_district_data

router = APIRouter()

@router.get("/analytics/summary")
def analytics_summary():
    df = load_district_data()

    summary = {
        "total_districts": len(df),
        "avg_literacy_rate": df["literacy_rate"].mean(),
        "max_population_district": df.loc[df["population"].idxmax()]["district"],
        "lowest_literacy_district": df.loc[df["literacy_rate"].idxmin()]["district"]
    }

    return summary