import sqlite3
from pathlib import Path
from app.core.config import DB_PATH

_db_initialized = False

def get_db_connection() -> sqlite3.Connection:
    global _db_initialized
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for concurrent reads/writes without lock contention
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    if not _db_initialized:
        init_tables(conn)
        _db_initialized = True
    return conn

def init_tables(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        raw_query TEXT NOT NULL,
        recommended_pathway TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        response_json TEXT NOT NULL
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evaluation_runs (
        run_id TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_cases INTEGER NOT NULL,
        quality_index REAL NOT NULL,
        metrics_json TEXT NOT NULL
    );
    """)
    conn.commit()

def init_db() -> None:
    conn = get_db_connection()
    conn.close()
