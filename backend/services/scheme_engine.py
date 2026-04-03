# Government scheme mapping for detected issues

SCHEME_DATABASE = {

    "low_literacy": [
        "Samagra Shiksha Abhiyan",
        "Beti Bachao Beti Padhao",
        "PM Poshan Yojana"
    ],

    "high_population": [
        "National Health Mission",
        "Skill India Mission",
        "PM Jan Arogya Yojana"
    ],

    "very_low_literacy": [
        "Saakshar Bharat Mission",
        "Digital Literacy Mission"
    ]

}

def detect_issues(district_data):

    issues = []

    literacy = district_data["literacy_rate"]
    population = district_data["population"]

    # Rule 1
    if literacy < 45:
        issues.append("very_low_literacy")

    # Rule 2
    elif literacy < 65 and literacy >= 45:
        issues.append("low_literacy")

    # Rule 3
    if population > 1000000:
        issues.append("high_population")

    return issues

def recommend_schemes(district_data):

    issues = detect_issues(district_data)
    literacy = float(district_data["literacy_rate"])
    population = int(district_data["population"])

    schemes = []
    issue_details = []
    scheme_explanations = {}

    for issue in issues:
        if issue in SCHEME_DATABASE:
            schemes.extend(SCHEME_DATABASE[issue])

    if "very_low_literacy" in issues:
        issue_details.append(
            {
                "issue": "very_low_literacy",
                "reason": f"Literacy rate is {literacy:.2f}%, which is below the 45% trigger.",
                "priority": "high",
            }
        )
    if "low_literacy" in issues:
        issue_details.append(
            {
                "issue": "low_literacy",
                "reason": f"Literacy rate is {literacy:.2f}%, which is between 45% and 65%.",
                "priority": "medium",
            }
        )
    if "high_population" in issues:
        issue_details.append(
            {
                "issue": "high_population",
                "reason": f"Population is {population:,}, which exceeds the 1,000,000 threshold.",
                "priority": "medium",
            }
        )

    for scheme_name in set(schemes):
        reasons = []
        if scheme_name in {"Samagra Shiksha Abhiyan", "Beti Bachao Beti Padhao", "PM Poshan Yojana", "Saakshar Bharat Mission", "Digital Literacy Mission"}:
            if "very_low_literacy" in issues:
                reasons.append("Matched because the district has very low literacy and needs foundational education support.")
            elif "low_literacy" in issues:
                reasons.append("Matched because the district has below-average literacy and needs targeted education support.")
        if scheme_name in {"National Health Mission", "Skill India Mission", "PM Jan Arogya Yojana"} and "high_population" in issues:
            reasons.append("Matched because the district has high population pressure and needs scale-sensitive service delivery.")
        scheme_explanations[scheme_name] = reasons or ["Matched by the district policy rules in the scheme engine."]

    return {
        "district": district_data["district"],
        "issues": {f"{i.replace('_', ' ').title()}" for i in issues},
        "recommended_schemes": sorted(set(schemes)),
        "issue_details": issue_details,
        "scheme_explanations": scheme_explanations,
        "district_snapshot": {
            "state": district_data.get("state"),
            "literacy_rate": literacy,
            "population": population,
            "gender_ratio": district_data.get("gender_ratio"),
            "literacy_index": district_data.get("literacy_index"),
        },
    }
