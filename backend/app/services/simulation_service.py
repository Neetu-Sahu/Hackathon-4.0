from app.services.scoring_service import calculate_priority_score

def simulate_education_investment(df, increase_percent):
    df = df.copy()

    improvement = (increase_percent / 100) * 30
    df["literacy_rate"] = df["literacy_rate"] + improvement

    df["literacy_rate"] = df["literacy_rate"].clip(upper=95)

    # ✅ use SAME scoring logic everywhere
    df = calculate_priority_score(df)

    return df