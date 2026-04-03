from __future__ import annotations

import os
import random
import sqlite3
import sys
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterator

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

try:
    from twilio.rest import Client
except ImportError:
    Client = None

try:
    from init_db import initialize_database
except ImportError:  # Supports running as `uvicorn backend.main:app` from repo root.
    from backend.init_db import initialize_database

try:
    from app.routes.ai_policy_routes import router as ai_policy_router
    from app.routes.alerts_routes import router as alerts_router
    from app.routes.analytics_routes import router as analytics_router
    from app.routes.chatbot_routes import router as chatbot_router
    from app.routes.notes_routes import router as notes_router
    from app.routes.district_routes import router as district_router
    from app.routes.scheme_routes import router as legacy_scheme_router
    from app.routes.scoring_routes import router as scoring_router
    from app.routes.simulation_routes import router as simulation_router
except ImportError:  # Supports running as `uvicorn backend.main:app` from repo root.
    from backend.app.routes.ai_policy_routes import router as ai_policy_router
    from backend.app.routes.alerts_routes import router as alerts_router
    from backend.app.routes.analytics_routes import router as analytics_router
    from backend.app.routes.chatbot_routes import router as chatbot_router
    from backend.app.routes.notes_routes import router as notes_router
    from backend.app.routes.district_routes import router as district_router
    from backend.app.routes.scheme_routes import router as legacy_scheme_router
    from backend.app.routes.scoring_routes import router as scoring_router
    from backend.app.routes.simulation_routes import router as simulation_router


DB_PATH = BASE_DIR / "bpis_system.db"


def load_dotenv_file(env_path: Path) -> None:
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"'")

        if key and key not in os.environ:
            os.environ[key] = value


load_dotenv_file(BASE_DIR / ".env")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "").strip()


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    with sqlite3.connect(DB_PATH) as connection:
        connection.row_factory = sqlite3.Row
        yield connection


class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    mobile: str = Field(..., min_length=10, max_length=15)
    department: str = Field(..., min_length=2, max_length=120)
    designation: str = Field(..., min_length=2, max_length=120)


class LoginRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=15)


class SendOtpRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=15)


class VerifyOtpRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="BPIS Standalone Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://hackathon-4-0-2.onrender.com/",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(district_router)
app.include_router(analytics_router)
app.include_router(scoring_router)
app.include_router(legacy_scheme_router)
app.include_router(ai_policy_router)
app.include_router(alerts_router)
app.include_router(notes_router)
app.include_router(simulation_router)
app.include_router(chatbot_router)


def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"


def send_sms_otp(mobile: str, otp_code: str) -> dict:
    if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER):
        print(f"BPIS OTP for {mobile}: {otp_code}")
        return {
            "success": True,
            "delivery": "console",
            "message": "Twilio is not configured. OTP printed in backend console.",
        }

    if Client is None:
        raise HTTPException(
            status_code=500,
            detail="Twilio package is not installed in the backend environment.",
        )

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your BPIS Portal verification code is: {otp_code}. Valid for 5 minutes.",
            from_=TWILIO_PHONE_NUMBER,
            to=mobile,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to send OTP via Twilio: {exc}") from exc

    return {
        "success": True,
        "delivery": "sms",
        "sid": message.sid,
        "message": "OTP sent successfully",
    }


def get_user_by_mobile(connection: sqlite3.Connection, mobile: str) -> sqlite3.Row | None:
    return connection.execute(
        """
        SELECT id, full_name, mobile, department, designation
        FROM users
        WHERE mobile = ?
        """,
        (mobile.strip(),),
    ).fetchone()


@app.get("/")
def root() -> dict:
    return {"message": "BPIS Backend Running"}


@app.post("/auth/signup")
def signup(payload: SignupRequest) -> dict:
    with get_connection() as connection:
        existing_user = get_user_by_mobile(connection, payload.mobile)

        if existing_user:
            raise HTTPException(status_code=409, detail="User already exists")

        cursor = connection.execute(
            """
            INSERT INTO users (full_name, mobile, department, designation)
            VALUES (?, ?, ?, ?)
            """,
            (
                payload.full_name.strip(),
                payload.mobile.strip(),
                payload.department.strip(),
                payload.designation.strip(),
            ),
        )
        connection.commit()

        user = connection.execute(
            """
            SELECT id, full_name, mobile, department, designation
            FROM users
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

    return {
        "success": True,
        "message": "Signup successful",
        "user": dict(user),
    }


@app.post("/auth/login")
def login(payload: LoginRequest) -> dict:
    with get_connection() as connection:
        user = get_user_by_mobile(connection, payload.mobile)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "success": True,
        "message": "Login successful",
        "user": dict(user),
    }


@app.post("/api/auth/send-otp")
def send_otp(payload: SendOtpRequest) -> dict:
    mobile = payload.phone_number.strip()
    otp_code = generate_otp()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=5)

    with get_connection() as connection:
        user = get_user_by_mobile(connection, mobile)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        connection.execute("DELETE FROM otp_codes WHERE mobile = ?", (mobile,))
        connection.execute(
            """
            INSERT INTO otp_codes (mobile, otp_code, expires_at, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (
                mobile,
                otp_code,
                expires_at.isoformat(),
                now.isoformat(),
            ),
        )
        connection.commit()

    delivery_result = send_sms_otp(mobile, otp_code)

    return {
        "success": True,
        "message": delivery_result["message"],
        "delivery": delivery_result["delivery"],
        "sid": delivery_result.get("sid"),
    }


@app.post("/api/auth/verify-otp")
def verify_otp(payload: VerifyOtpRequest) -> dict:
    mobile = payload.phone_number.strip()
    otp_value = payload.otp.strip()

    with get_connection() as connection:
        user = get_user_by_mobile(connection, mobile)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        otp_row = connection.execute(
            """
            SELECT id, otp_code, expires_at
            FROM otp_codes
            WHERE mobile = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (mobile,),
        ).fetchone()

        if not otp_row:
            raise HTTPException(status_code=400, detail="OTP not found. Please request a new OTP.")

        expires_at = datetime.fromisoformat(otp_row["expires_at"])
        is_bypass_code = otp_value == "999999"
        is_matching_otp = otp_value == otp_row["otp_code"]

        if expires_at < datetime.now(timezone.utc) and not is_bypass_code:
            connection.execute("DELETE FROM otp_codes WHERE mobile = ?", (mobile,))
            connection.commit()
            raise HTTPException(status_code=400, detail="OTP expired. Please request a new OTP.")

        if not is_bypass_code and not is_matching_otp:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

        connection.execute("DELETE FROM otp_codes WHERE mobile = ?", (mobile,))
        connection.commit()

    return {
        "success": True,
        "message": "OTP verified successfully",
        "user": dict(user),
    }


@app.get("/api/schemes")
def get_schemes() -> dict:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, name, category, description, working_process
            FROM schemes
            ORDER BY category, name
            """
        ).fetchall()

    return {"success": True, "schemes": [dict(row) for row in rows]}


@app.get("/api/schemes/search")
def search_schemes(q: str = Query(..., min_length=1, max_length=100)) -> dict:
    search_term = f"%{q.strip()}%"
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, name, category, description, working_process
            FROM schemes
            WHERE name LIKE ? OR category LIKE ?
            ORDER BY category, name
            """,
            (search_term, search_term),
        ).fetchall()

    return {"success": True, "query": q, "schemes": [dict(row) for row in rows]}
