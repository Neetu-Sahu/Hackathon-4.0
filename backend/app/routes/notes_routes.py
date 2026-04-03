from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "bpis_system.db"


@contextmanager
def get_connection():
    with sqlite3.connect(DB_PATH) as connection:
        connection.row_factory = sqlite3.Row
        yield connection


router = APIRouter()


class DistrictNoteCreate(BaseModel):
    district: str = Field(..., min_length=1, max_length=120)
    author_name: str = Field(..., min_length=2, max_length=120)
    comment: str = Field(..., min_length=2, max_length=1000)
    tag: str = Field(..., min_length=2, max_length=60)
    action_item: str | None = Field(default=None, max_length=1000)


@router.get("/api/district-notes")
def list_district_notes(district: str | None = Query(default=None, max_length=120)):
    with get_connection() as connection:
        if district:
            rows = connection.execute(
                """
                SELECT id, district, author_name, comment, tag, action_item, created_at
                FROM district_notes
                WHERE lower(district) = lower(?)
                ORDER BY id DESC
                """,
                (district.strip(),),
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT id, district, author_name, comment, tag, action_item, created_at
                FROM district_notes
                ORDER BY id DESC
                LIMIT 100
                """
            ).fetchall()

    return {"success": True, "notes": [dict(row) for row in rows]}


@router.post("/api/district-notes")
def create_district_note(payload: DistrictNoteCreate):
    now = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO district_notes (district, author_name, comment, tag, action_item, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                payload.district.strip(),
                payload.author_name.strip(),
                payload.comment.strip(),
                payload.tag.strip(),
                (payload.action_item or "").strip() or None,
                now,
            ),
        )
        connection.commit()

        row = connection.execute(
            """
            SELECT id, district, author_name, comment, tag, action_item, created_at
            FROM district_notes
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=500, detail="Failed to create district note")

    return {"success": True, "note": dict(row)}
