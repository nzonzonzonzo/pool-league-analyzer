#!/usr/bin/env python3
"""
Master script to run both scrapers and then combine data.
This can be used as the main entry point for GitHub Actions.
"""
import os
import subprocess
import time
from datetime import datetime
from season_combiner import SeasonDataCombiner

def main():
    print("=" * 50)
    print(f"RUNNING BILLIARDS LEAGUE DATA PIPELINE")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    # Check if AUTH_COOKIE is set
    if not os.environ.get('AUTH_COOKIE'):
        print("WARNING: AUTH_COOKIE environment variable is not set. Scrapers may have limited functionality.")
    
    # Create data directory if it doesn't exist
    os.makedirs("public/data", exist_ok=True)
    os.makedirs("public/data/archives", exist_ok=True)
    os.makedirs("public/data/combined", exist_ok=True)
    
    # Step 1: Run match data scraper
    print("\n----- Running match data scraper -----")
    try:
        subprocess.run(["python", "scrapers/scraper.py"], check=True)
        print("Match data scraper completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running match data scraper: {e}")
    
    # Small delay between scrapers to be nice to the server
    time.sleep(2)
    
    # Step 2: Run player stats scraper
    print("\n----- Running player stats scraper -----")
    try:
        subprocess.run(["python", "scrapers/player_stats_scraper.py"], check=True)
        print("Player stats scraper completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error running player stats scraper: {e}")
    
    # Step 3: Run data combiner
    print("\n----- Running data combiner -----")
    try:
        combiner = SeasonDataCombiner()
        print("Available seasons:")
        combiner.list_available_seasons()
        combiner.save_combined_data()
        print("Data combiner completed successfully.")
    except Exception as e:
        print(f"Error running data combiner: {e}")
    
    print("\n" + "=" * 50)
    print(f"DATA PIPELINE COMPLETE")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

if __name__ == "__main__":
    main()
