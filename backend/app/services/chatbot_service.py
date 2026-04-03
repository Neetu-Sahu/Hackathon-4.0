import json
import os
import sqlite3
import time
import urllib.request
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from difflib import SequenceMatcher
from pathlib import Path
from typing import Iterator
from urllib.error import HTTPError, URLError

from app.services.data_service import load_district_data

try:
    from rapidfuzz import fuzz, process
except ImportError:
    fuzz = None
    process = None

try:
    from services.scheme_engine import SCHEME_DATABASE
except ImportError:
    try:
        from services.scheme_engine import SCHEME_DATABASE
    except ImportError:
        SCHEME_DATABASE = {}

def load_gemini_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key:
        return api_key

    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return ""

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        if key.strip() == "GEMINI_API_KEY":
            return value.strip().strip("\"'")

    return ""


GEMINI_API_KEY = load_gemini_api_key()
BASE_DIR = Path(__file__).resolve().parents[3]
DB_PATH = BASE_DIR / "backend" / "bpis_system.db"
DEFAULT_CONTEXT_STRING = "General Indian Census Data"
DISTRICT_MATCH_THRESHOLD = 80
STATIC_RESPONSE_DELAY_SECONDS = 1.25
STATIC_GREETING_RESPONSE = "Hello! I am the Bharat Policy Assistant. How can I help you navigate the dashboard today?"
IST_TIMEZONE = timezone(timedelta(hours=5, minutes=30))
SYSTEM_INSTRUCTION_TEMPLATE = """Today is {current_date}. Time: {current_time}.

You are a professional BPIS Assistant. Answer directly. Do not use meta-talk like "Based on my knowledge". Just give the answer.

Prioritize the 'Context from BPIS DB' provided in the prompt. If relevant data is present there, treat it as the absolute truth and do not contradict it.

If specific data for a requested district or scheme is missing, do not give a generic answer. State clearly that the data is being fetched or is unavailable.

Detect the user's language and respond in the exact same style if the user writes in English, Hindi, or Hinglish.

Keep technical terms like 'Literacy Rate', 'Priority Score', and 'PM SHRI' in English (Latin script) even when the rest of the response is in Hindi or Hinglish.

When providing data or lists, use clean Markdown. Do NOT add leading spaces, unnecessary asterisks, or extra newlines before bullet points. Use the format: Metric: Value (for example, Population: 1,117,361).

Be concise, professional, and useful for BPIS users."""

PROJECT_CONTEXT_CATALOG = {
    "dashboard": "The BPIS dashboard uses a fixed Sidebar, a top Navbar with an EN/HI language toggle, and a global floating chatbot.",
    "overview": "Overview page: shows a national district map and summary cards for high-level district metrics.",
    "analytics": "Analytics page: includes District Compare, priority distribution charts, population metrics, key policy insights, full district data, and high-priority targets.",
    "policy advisor": "Policy Advisor page: contains the AI policy advisor experience for policy-focused guidance.",
    "scheme repository": "Scheme Repository page: lists schemes from the backend database with search, category badges, description previews, and a detailed modal view.",
    "sidebar": "Sidebar navigation links to Overview, Analytics, Policy Advisor, and Scheme Repository.",
    "navbar": "Navbar shows the app title and supports English/Hindi language switching.",
    "chatbot": "The chatbot is a global floating assistant available across the authenticated dashboard.",
    "map": "Map view is shown on the Overview page as the national district view.",
    "district compare": "District Compare is available on the Analytics page for deeper district-level comparison.",
    "insights": "Insights and policy-oriented visual analysis are available on the Analytics page.",
}


LIGHT_REACTION_MESSAGES = {
    "very funny",
    "funny",
    "haha",
    "lol",
    "nice one",
    "good one",
    "thanks",
    "thank you",
}

# Cache for scheme categories to avoid repeated database queries
_scheme_categories_cache = None
_scheme_categories_timestamp = None
_cache_ttl = 600  # 10 minutes in seconds


def is_light_reaction(message: str) -> bool:
    return normalize_text(message) in LIGHT_REACTION_MESSAGES


def format_db_context_for_fallback(db_context: str) -> str:
    if db_context == DEFAULT_CONTEXT_STRING:
        return db_context

    lines = [line.strip() for line in db_context.splitlines() if line.strip()]
    cleaned_lines = [
        line
        for line in lines
        if line not in {"District Context:", "Scheme Context:"}
    ]
    if cleaned_lines:
        return "Here is the available data:\n" + "\n".join(cleaned_lines)

    return "\n".join(lines)


def build_fallback_response(
    user_query: str,
    intent: str | None = None,
    has_db_context: bool = False,
    db_context: str = DEFAULT_CONTEXT_STRING,
) -> str:
    if has_db_context and db_context != DEFAULT_CONTEXT_STRING:
        return format_db_context_for_fallback(db_context)

    if not has_db_context and is_light_reaction(user_query):
        return "Glad you liked it. Want another one?"

    if not has_db_context and intent in {"general_query", "joke"}:
        return (
            "I’m unable to reach the AI service right now. "
            "Please try your question again in a moment."
        )

    fallback_response = (
        "Hello! I am the Bharat Policy Intelligence Assistant (BPIA). "
        "You can ask me about specific districts to get a summary of their literacy and population. "
        "How can I help you navigate the BPIS dashboard today?"
    )

    district_df = load_district_data()
    district_names = match_districts(user_query, district_df["district"].dropna().unique())
    if district_names:
        district_lines = []
        for district_name in district_names:
            district_row = district_df[district_df["district"].str.lower() == district_name.lower()]
            if district_row.empty:
                continue

            district_data = district_row.iloc[0]
            literacy = district_data.get("literacy_rate", "N/A")
            population = district_data.get("population", "N/A")

            if isinstance(literacy, (int, float)):
                literacy = f"{literacy:.2f}%"
            else:
                literacy = format_metric(literacy)

            district_lines.append(
                f"- {str(district_name).title()}: Population {format_metric(population)}, Literacy Rate {literacy}"
            )

        if district_lines:
            fallback_response = (
                "Here is the available district data:\n"
                + "\n".join(district_lines)
                + "\n\nI could not connect to my AI core to provide further insights, but please refer to the dashboard for additional policy mapping."
            )

    return fallback_response


def serialize_history(history: list) -> str:
    if not history:
        return "[]"

    serialized_items = []
    for item in history:
        if isinstance(item, dict):
            role = str(item.get("role", "user")).strip() or "user"
            content = str(item.get("content") or item.get("message") or "").strip()
            if content:
                label = "Bot" if role.lower() in {"assistant", "bot", "ai"} else "User"
                serialized_items.append(f"{label}: {content}")
        else:
            content = str(item).strip()
            if content:
                serialized_items.append(f"User: {content}")

    if not serialized_items:
        return "[]"

    return "[" + " | ".join(serialized_items) + "]"


def get_recent_user_messages(history: list, limit: int = 4) -> list[str]:
    recent_messages = []
    for item in reversed(history):
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "user")).strip().lower()
        if role != "user":
            continue
        content = str(item.get("content") or item.get("message") or "").strip()
        if content:
            recent_messages.append(content)
        if len(recent_messages) >= limit:
            break
    return list(reversed(recent_messages))


def build_conversation_context(history: list, limit: int = 4) -> str:
    recent_messages = get_recent_user_messages(history, limit=limit)
    if not recent_messages:
        return "None"
    return " | ".join(recent_messages)


def build_effective_query(message: str, history: list) -> str:
    normalized_message = normalize_text(message)
    recent_context = build_conversation_context(history)

    short_follow_up_markers = {
        "list any 5",
        "list 5",
        "any 5",
        "show 5",
        "name 5",
        "give 5",
        "tell 5",
        "how many are there",
        "how many",
        "which ones",
        "what about this",
        "and this",
        "what else",
        "list",
        "show",
        "names",
        "stats",
    }

    referential_tokens = {"it", "this", "that", "there", "them", "these", "those"}
    tokens = normalized_message.split()
    has_referential_token = any(token in referential_tokens for token in tokens)
    is_short_follow_up = len(tokens) <= 4

    if recent_context != "None" and (
        normalized_message in short_follow_up_markers or
        (is_short_follow_up and has_referential_token)
    ):
        return f"{recent_context} | Follow-up: {message}"

    return message


def get_recent_user_context(history: list, limit: int = 3) -> str:
    recent_messages = []
    for item in reversed(history):
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "user")).strip().lower()
        if role not in {"user", "User".lower()}:
            continue
        content = str(item.get("content") or item.get("message") or "").strip()
        if content:
            recent_messages.append(content)
        if len(recent_messages) >= limit:
            break

    return " ".join(reversed(recent_messages))


def get_total_scheme_count() -> int:
    with get_db_connection() as connection:
        row = connection.execute("SELECT COUNT(*) AS count FROM schemes").fetchone()
    return int(row["count"]) if row and row["count"] is not None else 0


def fetch_scheme_names(limit: int = 5) -> list[str]:
    with get_db_connection() as connection:
        rows = connection.execute(
            """
            SELECT name
            FROM schemes
            WHERE name IS NOT NULL AND TRIM(name) <> ''
            ORDER BY name
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [row["name"].strip() for row in rows if row["name"]]


def get_scheme_list_context(query: str) -> str:
    normalized_query = normalize_text(query)
    scheme_list_markers = {
        "list any 5",
        "list 5",
        "any 5",
        "show 5",
        "name 5",
        "give 5",
        "tell 5",
        "list schemes",
        "scheme names",
        "schemes available",
    }

    if not any(marker in normalized_query for marker in scheme_list_markers):
        return ""

    scheme_names = fetch_scheme_names(limit=5)
    if not scheme_names:
        return ""

    return "Available scheme examples:\n" + "\n".join(f"- {name}" for name in scheme_names)


def get_project_context(query: str) -> str:
    normalized_query = normalize_text(query)
    if not normalized_query:
        return ""

    matched_contexts = []
    for keyword, description in PROJECT_CONTEXT_CATALOG.items():
        if keyword in normalized_query:
            matched_contexts.append(description)

    if (
        "scheme repository" in normalized_query
        or "repository section" in normalized_query
        or "how many schemes" in normalized_query
    ):
        matched_contexts.append(
            f"Scheme Repository currently draws from the backend schemes table, which has {get_total_scheme_count()} schemes."
        )

    if any(term in normalized_query for term in {"website", "app", "project", "dashboard components", "pages"}):
        matched_contexts = [
            PROJECT_CONTEXT_CATALOG["dashboard"],
            PROJECT_CONTEXT_CATALOG["overview"],
            PROJECT_CONTEXT_CATALOG["analytics"],
            PROJECT_CONTEXT_CATALOG["policy advisor"],
            PROJECT_CONTEXT_CATALOG["scheme repository"],
            PROJECT_CONTEXT_CATALOG["sidebar"],
            PROJECT_CONTEXT_CATALOG["navbar"],
            PROJECT_CONTEXT_CATALOG["chatbot"],
        ] + matched_contexts

    if not matched_contexts:
        return ""

    deduped_contexts = []
    seen = set()
    for item in matched_contexts:
        if item not in seen:
            seen.add(item)
            deduped_contexts.append(item)

    return "\n".join(f"- {item}" for item in deduped_contexts)


def get_current_context() -> tuple[str, str]:
    now = datetime.now(IST_TIMEZONE)
    return now.strftime("%B %d, %Y"), now.strftime("%I:%M %p")


def get_current_weekday() -> str:
    now = datetime.now(IST_TIMEZONE)
    return now.strftime("%A")


def is_simple_greeting(message: str) -> bool:
    normalized_message = normalize_text(message)
    greeting_tokens = {
        "hello",
        "hi","hii",
        "hey",
        "namaste",
        "how are you",
        "how are you doing",
        "good morning",
        "good afternoon",
        "good evening",
    }
    return normalized_message in greeting_tokens


def is_date_or_time_query(message: str) -> bool:
    normalized_message = normalize_text(message)
    date_keywords = {
        "date",
        "today date",
        "today's date",
        "todays date",
        "what is today's date",
        "what is todays date",
        "what is the date today",
        "what day is it",
        "what day is today",
        "today day",
        "time",
        "current time",
        "what time is it",
        "what is the time",
        "today",
    }
    return any(keyword in normalized_message for keyword in date_keywords)


def detect_date_time_intent(message: str) -> str:
    normalized_message = normalize_text(message)

    time_keywords = {
        "time",
        "current time",
        "what time is it",
        "what is the time",
        "time now",
        "what time it is now",
    }
    day_keywords = {
        "what day is it",
        "what day is today",
        "today day",
        "day today",
        "which day is today",
    }
    date_keywords = {
        "date",
        "today date",
        "today's date",
        "todays date",
        "what is today's date",
        "what is todays date",
        "what is the date today",
    }

    if any(keyword in normalized_message for keyword in time_keywords):
        return "time_only"
    if any(keyword in normalized_message for keyword in day_keywords):
        return "day_only"
    if any(keyword in normalized_message for keyword in date_keywords):
        return "date_only"
    return "date_time"


def build_date_time_response(message: str, current_language: str) -> str:
    current_date, current_time = get_current_context()
    current_day = get_current_weekday()
    intent = detect_date_time_intent(message)

    if current_language == "hi":
        if intent == "time_only":
            return f"Current Time: {current_time}."
        if intent == "day_only":
            return f"Aaj {current_day} hai."
        if intent == "date_only":
            return f"Aaj ki date {current_date} hai."
        return (
            f"Aaj ki date {current_date} hai. Aaj {current_day} hai. "
            f"Current Time: {current_time}."
        )

    if intent == "time_only":
        return f"Current Time: {current_time}."
    if intent == "day_only":
        return f"Today is {current_day}."
    if intent == "date_only":
        return f"Today's date is {current_date}."
    return f"Today's date is {current_date}. Today is {current_day}. Current Time: {current_time}."


def detect_intent(message: str, db_context: str) -> str:
    normalized_message = normalize_text(message)
    has_district_context = "district context:" in db_context.lower()
    has_scheme_context = "scheme context:" in db_context.lower()

    if has_district_context and has_scheme_context:
        return "district_and_scheme_query"
    if has_district_context:
        return "district_query"
    if has_scheme_context:
        return "scheme_query"

    if is_simple_greeting(normalized_message):
        return "greeting"

    if "joke" in normalized_message or "funny" in normalized_message:
        return "joke"

    return "general_query"


def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    current_date, current_time = get_current_context()
    system_instruction = SYSTEM_INSTRUCTION_TEMPLATE.format(
        current_date=current_date,
        current_time=current_time,
    )
    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.35,
            "topP": 0.9,
            "maxOutputTokens": 512
        }
    }
    data = json.dumps(payload).encode("utf-8")
    gemini_api_url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    )
    req = urllib.request.Request(gemini_api_url, data=data, headers={"Content-Type": "application/json"})

    last_error = None
    for attempt in range(2):  # Reduced from 3 to 2 attempts
        try:
            with urllib.request.urlopen(req, timeout=15.0) as response:  # Reduced from 20.0 to 15.0 seconds
                result = json.loads(response.read().decode("utf-8"))
                return result["candidates"][0]["content"]["parts"][0]["text"]
        except (HTTPError, URLError, TimeoutError, KeyError, IndexError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < 1:
                time.sleep(0.5)  # Reduced delay to 0.5 seconds instead of (attempt + 1)
                continue
            raise RuntimeError(f"Gemini request failed after retries: {exc}") from exc

    raise RuntimeError(f"Gemini request failed: {last_error}")


def sanitize_chatbot_text(text: str) -> str:
    return str(text).replace("* ", "").strip()


def apply_static_response_delay() -> None:
    # Delay removed for better performance - responses should be instant
    pass


def get_chatbot_reply(message: str, history: list | None = None, current_language: str = "en") -> dict:
    if is_simple_greeting(message):
        apply_static_response_delay()
        return {
            "answer": STATIC_GREETING_RESPONSE,
            "source": "general",
            "detected_intent": "greeting",
        }

    if is_date_or_time_query(message):
        apply_static_response_delay()
        return {
            "answer": build_date_time_response(message, current_language),
            "source": "general",
            "detected_intent": "date_time_query",
        }

    history = history or []
    conversation_context = build_conversation_context(history)
    effective_query = build_effective_query(message, history)
    db_context = get_db_context(effective_query)
    scheme_list_context = get_scheme_list_context(effective_query)
    if scheme_list_context:
        if db_context == DEFAULT_CONTEXT_STRING:
            db_context = scheme_list_context
        else:
            db_context = f"{db_context}\n\n{scheme_list_context}"

    intent = detect_intent(message, db_context)
    source = "database_augmented" if db_context != DEFAULT_CONTEXT_STRING else "general"
    fallback_response = build_fallback_response(
        message,
        intent=intent,
        has_db_context=(db_context != DEFAULT_CONTEXT_STRING),
        db_context=db_context,
    )
    serialized_history = serialize_history(history)
    project_context = get_project_context(effective_query)

    prompt = (
        f"Conversation History: {serialized_history}\n"
        f"Conversation Context: {conversation_context}\n"
        f"Effective Query: {effective_query}\n"
        f"Local Context: {db_context}\n"
        f"Project Context: {project_context or 'None'}\n"
        f"User Query: {message}\n"
        f"Current Language Hint: {current_language}\n"
        "Response Requirements:\n"
        f"- Detected intent: {intent}\n"
        f"- Source classification target: {source}\n"
        f"- If Local Context is '{DEFAULT_CONTEXT_STRING}', answer with general knowledge naturally and directly.\n"
        "- If Project Context is provided, use it to answer questions about pages, sections, navigation, and website components accurately.\n"
        "- Use Conversation Context and Effective Query to resolve short follow-up messages naturally.\n"
        "- If the user asks something unrelated to BPIS, districts, or schemes, still answer the question helpfully instead of redirecting back to BPIS.\n"
        "- If specific data for a requested district or scheme is missing, do not give a generic answer. State clearly that the data is being fetched or is unavailable.\n"
        "- For light requests like jokes or casual chat, give a direct natural answer.\n"
        "- Match the user's language style: English, Hindi, or Hinglish.\n"
        "- Keep technical terms like Literacy Rate, Priority Score, and PM SHRI in English.\n"
        "- Format data and lists in clean Markdown with compact bullets or Metric: Value lines.\n"
        "- Provide a concise, professional answer suitable for a government official."
    )

    try:
        answer = sanitize_chatbot_text(call_gemini(prompt))
        return {
            "answer": answer,
            "source": source,
            "detected_intent": intent,
        }
    except Exception as e:
        print(f"Error calling Gemini REST API: {e}")
        return {
            "answer": sanitize_chatbot_text(fallback_response),
            "source": source,
            "detected_intent": intent,
        }


def get_chatbot_response(user_query: str) -> str:
    return get_chatbot_reply(user_query)["answer"]


@contextmanager
def get_db_connection() -> Iterator[sqlite3.Connection]:
    with sqlite3.connect(DB_PATH) as connection:
        connection.row_factory = sqlite3.Row
        yield connection


def normalize_text(value: str) -> str:
    return " ".join(str(value).lower().strip().split())


def format_metric(value) -> str:
    if value is None:
        return "N/A"
    if isinstance(value, float):
        return f"{value:.2f}"
    return str(value)


def _get_district_pairs(districts) -> list[tuple[str, str]]:
    district_pairs = []
    for district in districts:
        district_name = str(district).strip()
        if not district_name:
            continue
        district_pairs.append((district_name, normalize_text(district_name)))
    return district_pairs


def _get_query_candidates(normalized_query: str, district_pairs: list[tuple[str, str]]) -> list[str]:
    query_tokens = normalized_query.split()
    query_candidates = []
    max_district_words = max(
        (len(normalized_district.split()) for _, normalized_district in district_pairs),
        default=1,
    )
    for size in range(1, max_district_words + 1):
        for start_index in range(len(query_tokens) - size + 1):
            candidate = " ".join(query_tokens[start_index : start_index + size])
            if candidate:
                query_candidates.append(candidate)
    return query_candidates


def match_districts(query: str, districts) -> list[str]:
    normalized_query = normalize_text(query)
    if not normalized_query:
        return []

    district_pairs = _get_district_pairs(districts)
    if not district_pairs:
        return []

    matches = []
    seen = set()

    def add_match(district_name: str) -> None:
        normalized_name = normalize_text(district_name)
        if normalized_name not in seen:
            seen.add(normalized_name)
            matches.append(district_name)

    for district_name, normalized_district in district_pairs:
        if normalized_district in normalized_query:
            add_match(district_name)

    query_candidates = _get_query_candidates(normalized_query, district_pairs)

    if process is not None and fuzz is not None:
        normalized_to_original = {
            normalized_district: district_name
            for district_name, normalized_district in district_pairs
        }
        for candidate in query_candidates:
            candidate_match = process.extractOne(
                candidate,
                list(normalized_to_original.keys()),
                scorer=fuzz.ratio,
                score_cutoff=DISTRICT_MATCH_THRESHOLD,
            )
            if candidate_match:
                add_match(normalized_to_original[candidate_match[0]])
    else:
        for candidate in query_candidates:
            best_match_name = None
            best_score = 0.0
            for district_name, normalized_district in district_pairs:
                score = SequenceMatcher(None, candidate, normalized_district).ratio() * 100
                if score > best_score:
                    best_score = score
                    best_match_name = district_name
            if best_score >= DISTRICT_MATCH_THRESHOLD and best_match_name:
                add_match(best_match_name)

    return matches


def match_district(query: str, districts) -> str | None:
    matches = match_districts(query, districts)
    return matches[0] if matches else None


def get_scheme_categories() -> list[str]:
    """Get scheme categories with caching to avoid repeated database queries."""
    global _scheme_categories_cache, _scheme_categories_timestamp
    
    # Check if cache is still valid
    if _scheme_categories_cache is not None and _scheme_categories_timestamp is not None:
        if time.time() - _scheme_categories_timestamp < _cache_ttl:
            return _scheme_categories_cache
    
    # Query fresh data from database
    with get_db_connection() as connection:
        rows = connection.execute(
            """
            SELECT DISTINCT category
            FROM schemes
            WHERE category IS NOT NULL AND TRIM(category) <> ''
            ORDER BY category
            """
        ).fetchall()

    result = [row["category"].strip() for row in rows if row["category"]]
    
    # Update cache
    _scheme_categories_cache = result
    _scheme_categories_timestamp = time.time()
    
    return result


def match_scheme_categories(query: str, categories: list[str]) -> list[str]:
    normalized_query = normalize_text(query)
    matches = []

    for category in categories:
        normalized_category = normalize_text(category)
        if normalized_category and normalized_category in normalized_query:
            matches.append(category)

    return matches


def has_scheme_intent(query: str) -> bool:
    normalized_query = normalize_text(query)
    return "scheme" in normalized_query or "schemes" in normalized_query


def fetch_top_scheme_categories(limit: int = 3) -> list[str]:
    with get_db_connection() as connection:
        rows = connection.execute(
            """
            SELECT category, COUNT(*) AS scheme_count
            FROM schemes
            WHERE category IS NOT NULL AND TRIM(category) <> ''
            GROUP BY category
            ORDER BY scheme_count DESC, category ASC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [row["category"].strip() for row in rows if row["category"]]


def get_scheme_context_categories(query: str, categories: list[str], limit: int = 3) -> list[str]:
    ordered_categories = []
    seen = set()

    for category in match_scheme_categories(query, categories):
        normalized_category = normalize_text(category)
        if normalized_category not in seen:
            seen.add(normalized_category)
            ordered_categories.append(category)
        if len(ordered_categories) >= limit:
            return ordered_categories

    for category in fetch_top_scheme_categories(limit=limit):
        normalized_category = normalize_text(category)
        if normalized_category not in seen:
            seen.add(normalized_category)
            ordered_categories.append(category)
        if len(ordered_categories) >= limit:
            break

    return ordered_categories


def fetch_top_schemes_by_category(category: str, limit: int = 3) -> list[sqlite3.Row]:
    with get_db_connection() as connection:
        rows = connection.execute(
            """
            SELECT name, description
            FROM schemes
            WHERE category = ?
            ORDER BY name
            LIMIT ?
            """,
            (category, limit),
        ).fetchall()

    return rows


def build_district_context(found_districts: list[str], district_rows_by_name: dict[str, object]) -> list[str]:
    lines = ["District Context:"]

    for district_name in found_districts:
        district_row = district_rows_by_name.get(normalize_text(district_name))
        if district_row is None:
            lines.append(
                f"- {district_name.title()}: Data is unavailable right now or still being fetched."
            )
            continue

        literacy = district_row.get("literacy_rate", "N/A")
        population = district_row.get("population", "N/A")

        if isinstance(literacy, (int, float)):
            literacy = f"{literacy:.2f}%"
        else:
            literacy = format_metric(literacy)

        lines.append(
            f"- {district_name.title()}: Population {format_metric(population)}, Literacy Rate {literacy}"
        )

    return lines


def build_scheme_context(categories: list[str]) -> list[str]:
    lines = ["Scheme Context:"]

    for category in categories:
        schemes = fetch_top_schemes_by_category(category)
        valid_schemes = [
            scheme
            for scheme in schemes
            if scheme["name"] and scheme["description"]
        ]
        if not valid_schemes:
            lines.append(f"Category: {category}")
            lines.append("Data Status: Scheme data is unavailable right now or still being fetched.")
            continue

        lines.append(f"Category: {category}")
        for index, scheme in enumerate(valid_schemes, start=1):
            lines.append(f"{index}. {scheme['name']}")
            lines.append(f"Short Description: {scheme['description']}")

    return lines if len(lines) > 1 else []


def get_db_context(query: str) -> str:
    df = load_district_data()
    district_names = df["district"].dropna().unique()
    found_districts = match_districts(query, district_names)

    context_sections = []

    if found_districts:
        district_rows_by_name = {
            normalize_text(row["district"]): row
            for _, row in df.iterrows()
            if row.get("district")
        }
        context_sections.append(build_district_context(found_districts, district_rows_by_name))

    categories = get_scheme_categories()
    if has_scheme_intent(query):
        selected_categories = get_scheme_context_categories(query, categories, limit=3)
        if selected_categories:
            scheme_context = build_scheme_context(selected_categories)
            if scheme_context:
                context_sections.append(scheme_context)
        else:
            context_sections.append(
                [
                    "Scheme Context:",
                    "Data Status: Scheme data is unavailable right now or still being fetched.",
                ]
            )

    if not context_sections:
        return DEFAULT_CONTEXT_STRING

    return "\n\n".join("\n".join(section) for section in context_sections)
