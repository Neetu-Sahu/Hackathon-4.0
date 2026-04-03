import random

# -------------------------------------------------------------------
#  BPIS Diverse Scheme Database — 4 categories, 4-5 schemes each
#  All names are translation keys that map to translations.json
# -------------------------------------------------------------------
SCHEME_DATABASE = {

    "Education": [
        "PM SHRI",
        "Samagra Shiksha Abhiyan",
        "Beti Bachao Beti Padhao",
        "Saakshar Bharat Mission",
        "PM Poshan Yojana",
    ],

    "Health": [
        "PM-JAY",
        "National Health Mission",
        "Pradhan Mantri Surakshit Matritva Abhiyan",
        "Poshan Abhiyan",
        "ASHA Programme",
    ],

    "Digital_Skill": [
        "PM Kaushal Vikas Yojana",
        "Digital India Mission",
        "Skill India Mission",
        "BharatNet Programme",
        "PMGDISHA",
    ],

    "Infrastructure": [
        "Jal Jeevan Mission",
        "PM Awas Yojana",
        "Smart Cities Mission",
        "AMRUT",
        "Pradhan Mantri Gram Sadak Yojana",
    ],
}


def _detect_needs(d) -> list[str]:
    """
    Identify which scheme categories a district needs
    based on its socio-economic metrics.
    Returns a list of category names from SCHEME_DATABASE.
    """
    needs = []
    literacy = d.get("literacy_rate", 100)
    population = d.get("population", 0)
    priority_score = d.get("priority_score", 0)

    # Education need — critically low or moderate literacy
    if literacy < 65:
        needs.append("Education")

    # Health need — large population creates healthcare pressure
    if population > 1_000_000:
        needs.append("Health")

    # Digital / Skill need — very low literacy, needs skilling pipeline
    if literacy < 50:
        needs.append("Digital_Skill")

    # Infrastructure need — high priority score signals under-development
    if priority_score > 85:
        needs.append("Infrastructure")

    # Fallback: always include at least two categories
    if not needs:
        needs = ["Education", "Infrastructure"]

    return needs


def get_schemes_for_district(d) -> list[str]:
    """
    Return a randomized Policy Mix of 2-4 schemes tailored to
    the district's specific needs. Keys returned are translation keys
    that the frontend passes through t() for localization.

    Safety: Data keys (literacy_rate, population, priority_score) are
    NEVER modified — only labels/display names are localized on the frontend.
    """
    needs = _detect_needs(d)

    # Collect all eligible schemes from detected categories
    pool: list[str] = []
    for category in needs:
        pool.extend(SCHEME_DATABASE.get(category, []))

    # Deduplicate while keeping order
    seen = set()
    unique_pool = [s for s in pool if not (s in seen or seen.add(s))]

    # Random sample: 2 – min(4, pool_size) schemes
    k = min(len(unique_pool), random.randint(2, 4))
    return random.sample(unique_pool, k)