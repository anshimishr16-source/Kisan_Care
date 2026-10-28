import sqlite3
from pathlib import Path
from contextlib import contextmanager

# Store the database beside this file.
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "agriculture.db"


@contextmanager
def get_connection():
    """Open and safely close a database connection."""
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row

    try:
        connection.execute("PRAGMA foreign_keys = ON")
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_db():
    """Create all database tables if they do not exist."""

    with get_connection() as conn:

        conn.executescript("""
        CREATE TABLE IF NOT EXISTS farmers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_code TEXT UNIQUE NOT NULL,
            preferred_language TEXT DEFAULT 'auto',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS diagnosis_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_code TEXT,
            crop TEXT NOT NULL,
            growth_stage TEXT,
            problem_description TEXT NOT NULL,
            location TEXT,
            language TEXT DEFAULT 'auto',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_code)
                REFERENCES farmers(farmer_code)
        );

        CREATE TABLE IF NOT EXISTS uploaded_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query_id INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            original_filename TEXT,
            content_type TEXT,
            file_size INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (query_id)
                REFERENCES diagnosis_queries(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS diagnosis_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query_id INTEGER NOT NULL UNIQUE,
            ai_model TEXT,
            analysis TEXT NOT NULL,
            possible_causes TEXT,
            recommendations TEXT,
            confidence TEXT,
            follow_up_questions TEXT,
            tests_needed TEXT,
            disclaimer TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (query_id)
                REFERENCES diagnosis_queries(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT NOT NULL,
            farmer_code TEXT,
            role TEXT NOT NULL
                CHECK (role IN ('user', 'assistant')),
            message TEXT NOT NULL,
            language TEXT DEFAULT 'auto',
            crop TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_code)
                REFERENCES farmers(farmer_code)
        );

        CREATE TABLE IF NOT EXISTS agriculture_knowledge (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            crop TEXT,
            problem_type TEXT,
            symptoms TEXT NOT NULL,
            possible_causes TEXT,
            recommended_actions TEXT,
            prevention TEXT,
            source_name TEXT,
            source_url TEXT,
            language TEXT DEFAULT 'en',
            verified INTEGER DEFAULT 0,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_queries_crop
            ON diagnosis_queries(crop);

        CREATE INDEX IF NOT EXISTS idx_queries_created
            ON diagnosis_queries(created_at);

        CREATE INDEX IF NOT EXISTS idx_reports_query
            ON diagnosis_reports(query_id);

        CREATE INDEX IF NOT EXISTS idx_chat_conversation
            ON chat_messages(conversation_id);

        CREATE INDEX IF NOT EXISTS idx_knowledge_crop
            ON agriculture_knowledge(crop);
        """)


def save_diagnosis(
    crop,
    growth_stage,
    problem_description,
    language,
    analysis,
    image_metadata=None,
    farmer_code=None,
    location=None,
    ai_model="llava",
):
    """Save a diagnosis query, image references and AI report."""

    image_metadata = image_metadata or []

    with get_connection() as conn:

        cursor = conn.execute("""
            INSERT INTO diagnosis_queries (
                farmer_code,
                crop,
                growth_stage,
                problem_description,
                location,
                language
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            farmer_code,
            crop or "Unknown",
            growth_stage or "Unknown",
            problem_description,
            location,
            language,
        ))

        query_id = cursor.lastrowid

        for image in image_metadata:
            conn.execute("""
                INSERT INTO uploaded_images (
                    query_id,
                    file_path,
                    original_filename,
                    content_type,
                    file_size
                )
                VALUES (?, ?, ?, ?, ?)
            """, (
                query_id,
                image["file_path"],
                image.get("original_filename"),
                image.get("content_type"),
                image.get("file_size"),
            ))

        conn.execute("""
            INSERT INTO diagnosis_reports (
                query_id,
                ai_model,
                analysis,
                possible_causes,
                recommendations,
                confidence,
                follow_up_questions,
                tests_needed,
                disclaimer
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            query_id,
            ai_model,
            analysis,
            None,
            None,
            None,
            None,
            None,
            "Preliminary AI guidance, not a confirmed diagnosis.",
        ))

        return query_id


def save_chat_message(
    conversation_id,
    role,
    message,
    language="auto",
    crop=None,
    farmer_code=None,
):
    """Save one farmer question or assistant reply."""

    if role not in ("user", "assistant"):
        raise ValueError("Invalid chat message role.")

    with get_connection() as conn:
        cursor = conn.execute("""
            INSERT INTO chat_messages (
                conversation_id,
                farmer_code,
                role,
                message,
                language,
                crop
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            conversation_id,
            farmer_code,
            role,
            message,
            language,
            crop,
        ))

        return cursor.lastrowid


def search_knowledge(keyword, crop=None, limit=10):
    """Search the reference knowledge table."""

    with get_connection() as conn:
        return conn.execute("""
            SELECT *
            FROM agriculture_knowledge
            WHERE (
                topic LIKE ?
                OR symptoms LIKE ?
                OR possible_causes LIKE ?
            )
            AND (? IS NULL OR crop = ? OR crop IS NULL)
            AND verified = 1
            ORDER BY crop DESC
            LIMIT ?
        """, (
            f"%{keyword}%",
            f"%{keyword}%",
            f"%{keyword}%",
            crop,
            crop,
            limit,
        )).fetchall()


if __name__ == "__main__":
    init_db()
    print(f"Database created successfully: {DB_PATH}") 