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
        from app.database import engine
        from app.models import Base
        import sqlite3
        
        # Check if database exists and has data
        if not os.path.exists('./fairwork.db'):
            print("🗃️  Database not found. Creating and seeding database...")
            # Create tables
            Base.metadata.create_all(bind=engine)
            # Seed with mock data
            subprocess.run([sys.executable, "seed_data.py"], check=True)
            print("✅ Database initialized successfully!")
        else:
            # Check if database has any data
            conn = sqlite3.connect('./fairwork.db')
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            conn.close()
            
            if user_count == 0:
                print("🌱 Database exists but is empty. Seeding with mock data...")
                subprocess.run([sys.executable, "seed_data.py"], check=True)
                print("✅ Database seeded successfully!")
            else:
                print(f"📊 Database found with {user_count} users")
                
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