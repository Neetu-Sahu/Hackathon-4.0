import random
import sqlite3
from pathlib import Path

import pandas as pd

from app.services.scoring_service import compute_priority_scores


BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "bpis_system.db"


def normalize_district_name(name):
    return str(name).lower().strip()


class AIPolicyAdvisorService:
    EDUCATION_INSIGHTS = {
        "Critical Literacy Gap (Immediate Intervention Required)",
        "Stagnant Educational Infrastructure",
    }
    POPULATION_INSIGHTS = {
        "Extreme Public Service Pressure (Saturation Risk)",
        "High Urbanization & Density Strain",
        "Urban Management & Resource Pressure",
    }
    MAINTENANCE_INSIGHTS = {
        "Educational Quality Enhancement & Saturation",
        "Resource Optimization & Service Scaling",
        "Stable Socio-Economic Indicators: Routine Monitoring",
    }

    def _load_scores(self) -> pd.DataFrame:
        df = pd.DataFrame(compute_priority_scores())
        if not df.empty:
            df["district_normalized"] = df["district"].apply(normalize_district_name)
        return df

    def __init__(self):
        self.cached_df = self._load_scores()

    def _get_connection(self):
        connection = sqlite3.connect(DB_PATH)
        connection.row_factory = sqlite3.Row
        return connection

    def analyze_query(self, query: str) -> str:
        query = query.lower()

        if "education" in query or "literacy" in query:
            return "education"
        if "health" in query or "hospital" in query or "infrastructure" in query:
            return "health"
        if "high priority" in query or "risk" in query:
            return "priority"

        return "general"

    def get_districts_by_focus(self, focus: str) -> pd.DataFrame:
        df = self.cached_df if self.cached_df is not None else self._load_scores()

        if focus == "education":
            filtered = df[df["literacy_rate"] < 65]
        elif focus == "health":
            filtered = df[df["population"] > 1_000_000]
        elif focus == "priority":
            filtered = df.sort_values(by="priority_score", ascending=False)
        else:
            filtered = df

        return filtered.sort_values(by="priority_score", ascending=False).head(5)

    def get_district_by_name(self, district_name: str):
        normalized_name = normalize_district_name(district_name)
        df = self.cached_df if self.cached_df is not None else self._load_scores()
        match = df[df["district_normalized"] == normalized_name]
        if match.empty:
            return None
        return match.iloc[0]

    def get_district_insights(self, row) -> list[str]:
        literacy = float(row.get("literacy_rate", row.get("literacy", 0)) or 0)
        population = float(row.get("population", 0) or 0)
        insights = []

        if literacy < 40:
            insights.append("Critical Literacy Gap (Immediate Intervention Required)")
        elif 40 <= literacy <= 55:
            insights.append("Stagnant Educational Infrastructure")

        if population > 4_000_000:
            insights.append("Extreme Public Service Pressure (Saturation Risk)")
        elif 2_500_000 <= population <= 4_000_000:
            insights.append("High Urbanization & Density Strain")

        if literacy > 60 and population > 2_000_000:
            insights.append("Urban Management & Resource Pressure")

        if literacy > 62:
            insights.append("Educational Quality Enhancement & Saturation")

        if population < 2_000_000:
            insights.append("Resource Optimization & Service Scaling")

        if not insights:
            insights.append("Stable Socio-Economic Indicators: Routine Monitoring")

        return insights

    def _fetch_schemes_by_category(self, category: str) -> list[str]:
        with self._get_connection() as connection:
            rows = connection.execute(
                """
                SELECT name
                FROM schemes
                WHERE category = ?
                ORDER BY name
                """,
                (category,),
            ).fetchall()
        return [row["name"] for row in rows]

    def get_schemes_for_district(self, row, insights=None) -> list[str]:
        insights = insights or self.get_district_insights(row)
        recommendation_pool: list[str] = []

        if any(insight in self.EDUCATION_INSIGHTS for insight in insights):
            education_pool = self._fetch_schemes_by_category("Education")
            if education_pool:
                recommendation_pool.extend(
                    random.sample(education_pool, min(3, len(education_pool)))
                )

        if any(insight in self.POPULATION_INSIGHTS for insight in insights):
            health_pool = self._fetch_schemes_by_category("Health")
            infrastructure_pool = self._fetch_schemes_by_category("Infrastructure")

            if health_pool:
                recommendation_pool.extend(
                    random.sample(health_pool, min(1, len(health_pool)))
                )
            if infrastructure_pool:
                recommendation_pool.extend(
                    random.sample(infrastructure_pool, min(1, len(infrastructure_pool)))
                )

        if any(insight in self.MAINTENANCE_INSIGHTS for insight in insights):
            optimization_pool = self._fetch_schemes_by_category("Digital Skill")
            if optimization_pool:
                recommendation_pool.extend(
                    random.sample(optimization_pool, min(2, len(optimization_pool)))
                )

        if not recommendation_pool:
            fallback_pool = self._fetch_schemes_by_category("Education")
            if fallback_pool:
                recommendation_pool.extend(
                    random.sample(fallback_pool, min(3, len(fallback_pool)))
                )

        deduped_schemes = list(dict.fromkeys(recommendation_pool))
        return deduped_schemes

    def build_district_payload(self, row, focus: str) -> dict:
        insights = self.get_district_insights(row)
        schemes = self.get_schemes_for_district(row, insights=insights)
        priority_score = round(float(row["priority_score"]), 2)

        return {
            "district": row["district"],
            "district_normalized": normalize_district_name(row["district"]),
            "issues": insights,
            "recommended_schemes": schemes,
            "reason": (
                f"Based on a priority score of {priority_score}, this district requires urgent "
                f"resource reallocation in the {focus} sector to stabilize regional indicators."
            ),
        }

    def generate_response(self, query: str) -> dict:
        focus = self.analyze_query(query)
        if focus == "general" and any(k in query.lower() for k in ["sections", "website",'how many', 'pages']):
            return {
                "recommended_districts": [],
                "reason": "BPIS has 4 main sections: Overview, Analytics, Policy Advisor, Scheme Repository.",
                "supporting_data": [],
                "action": "info",
                "recommended_schemes": [],
                "issues": [],
            }

        districts = self.get_districts_by_focus(focus)

        response = {
            "recommended_districts": [],
            "reason": "",
            "supporting_data": [],
            "action": "",
            "recommended_schemes": [],
            "issues": [],
        }

        aggregated_issues: list[str] = []

        for _, row in districts.iterrows():
            district_payload = self.build_district_payload(row, focus)
            response["recommended_districts"].append(row["district"])
            response["supporting_data"].append(
                {
                    "district": row["district"],
                    "literacy": round(float(row["literacy_rate"]), 2),
                    "population": int(row["population"]),
                    "priority_score": round(float(row["priority_score"]), 2),
                    "issues": district_payload["issues"],
                }
            )
            response["recommended_schemes"].append(
                {
                    "district": row["district"],
                    "issues": district_payload["issues"],
                    "schemes": district_payload["recommended_schemes"],
                }
            )
            aggregated_issues.extend(district_payload["issues"])

            if not response["reason"]:
                response["reason"] = district_payload["reason"]

        response["issues"] = list(dict.fromkeys(aggregated_issues))

        if focus == "education":
            response["action"] = "Deploy education-focused schemes and improve school infrastructure."
        elif focus == "health":
            response["action"] = "action_health"
        elif focus == "priority":
            response["action"] = "action_priority"
        else:
            response["action"] = "action_general"

        return response

    def get_scheme_recommendation(self, district_name: str) -> dict:
        district_row = self.get_district_by_name(district_name)
        if district_row is None:
            return {"error": "District not found"}

        focus = "health" if float(district_row.get("population", 0) or 0) > 1_000_000 else "education"
        payload = self.build_district_payload(district_row, focus)

        # 1. District Snapshot (convert to native python types to prevent JSON serialize errors)
        import pandas as pd
        district_snapshot = {}
        for k, v in district_row.to_dict().items():
            if pd.isna(v):
                district_snapshot[k] = None
            elif hasattr(v, "item"):
                district_snapshot[k] = v.item()
            else:
                district_snapshot[k] = v

        # 2. Issue Details matching frontend {issue, reason} expectations
        issue_details = []
        literacy = float(district_row.get("literacy_rate", district_row.get("literacy", 0)) or 0)
        population = float(district_row.get("population", 0) or 0)

        if literacy < 40:
            issue_details.append({"issue": "CRITICAL_LITERACY_GAP", "reason": f"Literacy rate is severely low at {literacy}%, triggering an immediate intervention alert."})
        elif 40 <= literacy <= 55:
            issue_details.append({"issue": "STAGNANT_EDUCATION", "reason": f"Literacy rate is stagnant at {literacy}%, indicating a need for infrastructure improvements."})

        if population > 4_000_000:
            issue_details.append({"issue": "EXTREME_PRESSURE", "reason": f"High population of {population:,.0f} creates saturation risks for public services."})
        elif 2_500_000 <= population <= 4_000_000:
            issue_details.append({"issue": "HIGH_DENSITY_STRAIN", "reason": f"Substantial population of {population:,.0f} places strain on urban resources."})

        if literacy > 60 and population > 2_000_000:
            issue_details.append({"issue": "URBAN_MANAGEMENT_PRESSURE", "reason": "Combination of growing literacy and high population demands better resource scaling."})

        if literacy > 62:
            issue_details.append({"issue": "QUALITY_ENHANCEMENT", "reason": "Basic literacy achieved; focus should shift to educational quality and job skills."})

        if population < 2_000_000:
            issue_details.append({"issue": "SERVICE_SCALING", "reason": "Manageable population allows for focused resource optimization."})

        if not issue_details:
             issue_details.append({"issue": "ROUTINE_MONITORING", "reason": "Indicators are stable. Continue routine monitoring."})

        # 3. Scheme Explanations
        scheme_explanations = {}
        for scheme in payload["recommended_schemes"]:
            if any(k in scheme for k in ["Mission", "Abhiyan", "Padhao", "Bharat"]):
                scheme_explanations[scheme] = [f"{scheme} is well-suited to address the educational and socio-economic gaps highlighted by the current indicators in {payload['district']}."]
            elif "Yojana" in scheme:
                scheme_explanations[scheme] = [f"{scheme} provides structural and welfare support, directly mitigating the resource pressure and demographic strain measured in this district."]
            else:
                scheme_explanations[scheme] = [f"Deploying {scheme} will help stabilize the priority metrics flagged in the district snapshot."]

        return {
            "district": payload["district"],
            "issues": payload["issues"],
            "issue_details": issue_details,
            "recommended_schemes": payload["recommended_schemes"],
            "scheme_explanations": scheme_explanations,
            "district_snapshot": district_snapshot,
            "reason": payload["reason"],
        }


class PolicySimulator:
    CATEGORY_ALIASES = {
        "education": ("education", "literacy_rate"),
        "literacy": ("education", "literacy_rate"),
        "health": ("health", "population_weight"),
        "health_infrastructure": ("health", "population_weight"),
    }

    def __init__(self):
        self.df = pd.DataFrame(compute_priority_scores())
        if not self.df.empty:
            self.df["district_normalized"] = self.df["district"].apply(normalize_district_name)

    def resolve_category(self, category: str) -> tuple[str, str]:
        normalized_category = normalize_district_name(category or "education")
        return self.CATEGORY_ALIASES.get(
            normalized_category,
            (normalized_category or "education", "priority_score"),
        )

    def calculate_impact(self, current_score, funding_percentage):
        if funding_percentage <= 0:
            return round(float(current_score), 2)

        reduction_fraction = max(float(funding_percentage) / 200, 0.05)
        reduction_fraction = min(reduction_fraction, 1.0)
        new_score = float(current_score) * (1 - reduction_fraction)
        return round(max(new_score, 0.0), 2)

    def simulate(self, funding_percentage: int, category: str = "education") -> dict:
        resolved_category, mapped_column = self.resolve_category(category)

        df_baseline = self.df.sort_values(by="priority_score", ascending=False).copy()
        top_districts = df_baseline.head(5).copy()
        top_lookup = {
            normalize_district_name(row["district"]): row
            for _, row in top_districts.iterrows()
        }

        results = []
        chart_data = []
        data = []

        for normalized_name, row in top_lookup.items():
            current_score = round(float(row["priority_score"]), 2)
            new_score = self.calculate_impact(current_score, funding_percentage)

            result_row = {
                "district": row["district"],
                "current_score": current_score,
                "new_score": new_score,
                "priority_score": new_score,
                "funding_percentage": funding_percentage,
                "category": resolved_category,
                "mapped_column": mapped_column,
                "district_normalized": normalized_name,
            }
            results.append(result_row)
            data.append(
                {
                    "district": row["district"],
                    "priority_score": new_score,
                    "district_normalized": normalized_name,
                }
            )
            chart_data.append(
                {
                    "district": row["district"],
                    "before_score": current_score,
                    "after_score": new_score,
                }
            )

        summary = f"Impact analysis completed for {resolved_category}."
        return {
            "status": "success",
            "results": results,
            "summary": summary,
            "chart_data": chart_data,
            "data": data,
            "message": summary,
        }


_advisor_service = AIPolicyAdvisorService()


def generate_response(query: str) -> dict:
    return _advisor_service.generate_response(query)


def get_scheme_recommendation(district_name: str) -> dict:
    return _advisor_service.get_scheme_recommendation(district_name)
