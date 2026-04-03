from app.services.data_service import load_district_data

def calculate_priority_score(df):
    # Standardized formula for the entire app
    # 1. Calculate 'Need' based on Literacy
    df["illiteracy_rate"] = 100 - df["literacy_rate"]
    
    # 2. Normalize both values between 0 and 1
    # This prevents population (millions) from overpowering literacy (0-100)
    if df["population"].max() == df["population"].min():
        df["norm_pop"] = 0
    else:
        df["norm_pop"] = (df["population"] - df["population"].min()) / (df["population"].max() - df["population"].min())
    df["norm_illit"] = (df["illiteracy_rate"] - df["illiteracy_rate"].min()) / (df["illiteracy_rate"].max() - df["illiteracy_rate"].min())
    
    # 3. Apply weights (e.g., 60% weight to Need, 40% to Scale)
    # This results in a final score between 0 and 100
    df["priority_score"] = (
        (df["norm_illit"] * 0.6) + 
        (df["norm_pop"] * 0.4)
    ) * 100
    
    return df

    # df["priority_score"] = (
    #     (100 - df["literacy_rate"]) * 0.8 +
    #     (df["population"] * 0.00001)
    # )
    # return df

def compute_priority_scores():
    df = load_district_data()
    df = calculate_priority_score(df)
    df = df.sort_values(by="priority_score", ascending=False)
    
    return df.to_dict(orient="records")