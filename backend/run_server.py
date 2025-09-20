#!/usr/bin/env python3
"""
AI FairWork Backend Server
Run this script to start the FastAPI server
"""

import uvicorn
import sys
import os
import subprocess

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def initialize_database():
    """Initialize database with mock data if it doesn't exist."""
    try:
        from app.config import settings
        from app.database import engine
        from app.models import Base
        import sqlite3
        from urllib.parse import urlparse

        # Parse SQLite file path from settings.database_url
        db_url = settings.database_url
        if db_url.startswith("sqlite:///"):
            db_path = db_url.replace("sqlite:///", "")
        else:
            raise ValueError("Only sqlite databases are supported for auto-initialization.")

        db_dir = os.path.dirname(db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)

        # Check if database exists and has data
        if not os.path.exists(db_path):
            print(f"🗃️  Database not found at {db_path}. Creating and seeding database...")
            # Create tables
            Base.metadata.create_all(bind=engine)
            # Seed with mock data
            subprocess.run([sys.executable, "seed_data.py"], check=True)
            print("✅ Database initialized successfully!")
        else:
            # Always ensure tables exist (in case schema changed)
            Base.metadata.create_all(bind=engine)
            
            # Check if database has any data
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT COUNT(*) FROM users")
                user_count = cursor.fetchone()[0]
                conn.close()

                if user_count == 0:
                    print("🌱 Database exists but is empty. Seeding with mock data...")
                    subprocess.run([sys.executable, "seed_data.py"], check=True)
                    print("✅ Database seeded successfully!")
                else:
                    print(f"📊 Database found with {user_count} users")
            except sqlite3.OperationalError:
                # Table doesn't exist, seed the database
                conn.close()
                print("🌱 Database exists but tables missing. Seeding with mock data...")
                subprocess.run([sys.executable, "seed_data.py"], check=True)
                print("✅ Database seeded successfully!")
                
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
        print("Continuing with server startup...")

def main():
    """Run the FastAPI server."""
    print("🚀 Starting AI FairWork Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🛠️  Interactive API: http://localhost:8000/redoc")
    print("\n" + "="*50)
    
    # Initialize database
    initialize_database()
    
    print("\n🌐 Starting FastAPI server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()