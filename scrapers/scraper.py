import requests
from bs4 import BeautifulSoup
import json
import re
import time
import os
import urllib.parse
from datetime import datetime

# Get authentication cookie from environment variable
AUTH_COOKIE = os.environ.get('AUTH_COOKIE', '')

# Headers with authentication
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'Referer': 'https://leagues3.amsterdambilliards.com/8ball/abc/index.php?foo=bar',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Upgrade-Insecure-Requests': '1',
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'Cookie': AUTH_COOKIE
}

# Season date definitions
SEASONS = {
    'Spring': {'start': '01-15', 'end': '05-19'},
    'Summer': {'start': '05-21', 'end': '09-18'},
    'Fall': {'start': '09-19', 'end': '01-14'}
}

def determine_current_season():
    """Determine the current season based on the date."""
    today = datetime.now()
    current_month_day = today.strftime('%m-%d')
    current_year = today.year
    
    # Check which season we're in
    if SEASONS['Spring']['start'] <= current_month_day <= SEASONS['Spring']['end']:
        return {'name': 'Spring', 'year': current_year}
    elif SEASONS['Summer']['start'] <= current_month_day <= SEASONS['Summer']['end']:
        return {'name': 'Summer', 'year': current_year}
    elif SEASONS['Fall']['start'] <= current_month_day:
        return {'name': 'Fall', 'year': current_year}
    else:  # Jan 1 to Jan 14 is the end of previous year's Fall season
        return {'name': 'Fall', 'year': current_year - 1}

def is_season_ending_soon(days_threshold=7):
    """Check if the current season is ending soon (within days_threshold)."""
    today = datetime.now()
    current_season = determine_current_season()
    season_name = current_season['name']
    
    # Get the end date for the current season
    end_month, end_day = SEASONS[season_name]['end'].split('-')
    
    # Handle the Fall season that spans across years
    if season_name == 'Fall' and today.month < 2:
        # If it's January, the end date is in this year
        end_year = today.year
    elif season_name == 'Fall':
        # Otherwise, the Fall season ends next year
        end_year = today.year + 1
    else:
        end_year = today.year
    
    end_date = datetime(end_year, int(end_month), int(end_day))
    
    # Difference in days
    days_difference = (end_date - today).days
    
    return 0 <= days_difference <= days_threshold

def fetch_teams_directly():
    """Directly fetch teams from the standings page as a fallback"""
    print("Attempting to fetch teams directly from standings page...")
    
    url = "https://leagues3.amsterdambilliards.com/8ball/abc/team_standings.php"
    
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"Error accessing {url}: Status code {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        team_links = soup.find_all('a', href=re.compile(r'team_scouting_report\.php'))
        
        teams = []
        seen_teams = set()
        
        for link in team_links:
            team_name = link.text.strip()
            team_url = link['href']
            
            # If it's a relative URL, make it absolute
            if not team_url.startswith('http'):
                team_url = f"https://leagues3.amsterdambilliards.com{team_url}" if team_url.startswith('/') else f"https://leagues3.amsterdambilliards.com/8ball/abc/{team_url}"
            
            # Extract team_id 
            team_id_match = re.search(r'team_id=(\d+)', team_url)
            if not team_id_match:
                continue
                
            team_id = team_id_match.group(1)
            
            # Create a normalized team key to avoid duplicates
            team_key = f"{team_name}_{team_id}"
            if team_key in seen_teams:
                continue
                
            seen_teams.add(team_key)
            
            # Fix the URL to use season_nameid instead of season_id
            fixed_url = team_url.replace('season_id=', 'season_nameid=')
            
            teams.append({
                "name": team_name,
                "url": fixed_url
            })
        
        print(f"Successfully fetched {len(teams)} teams directly")
        return teams
        
    except Exception as e:
        print(f"Error fetching teams directly: {str(e)}")
        return []

# Skip the import attempt and go straight to fetching teams directly
try:
    # Fetch teams directly from the standings page
    TEAMS = fetch_teams_directly()
    
    # If direct fetching fails or returns empty list, use static list
    if not TEAMS:
        print("Warning: Direct team fetch failed, using fallback static list")
        TEAMS = [
            {"name": "Because 7 8 9", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=574"},
            {"name": "4 Q People", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=507"},
            {"name": "Alpha Sheep", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=581"},
            {"name": "Always Going For The Nine", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=234"},
            {"name": "Ball Busters", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=578"},
            {"name": "Ball In Hand", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=571"},
            {"name": "Ball So Hard", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=558"},
            {"name": "Ballz 2 The Wall", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=254"},
            {"name": "Bank Run", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=572"},
            # Add more teams as needed
        ]
        print(f"Using static list with {len(TEAMS)} teams")
    else:
        print(f"Successfully fetched {len(TEAMS)} teams directly")
        
except Exception as e:
    # In case of any error during direct fetching
    print(f"Error during team fetch: {str(e)}")
    print("Falling back to static team list")
    
    TEAMS = [
        {"name": "Because 7 8 9", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=574"},
        {"name": "4 Q People", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=507"},
        {"name": "Alpha Sheep", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=581"},
        {"name": "Always Going For The Nine", "url": "https://leagues3.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_nameid=234&team_id=234"},
        # Add more teams for your fallback static list
    ]
    print(f"Using static list with {len(TEAMS)} teams")

def extract_season_id(url):
    """Extract the season_id from the URL parameters"""
    parsed_url = urllib.parse.urlparse(url)
    query_params = urllib.parse.parse_qs(parsed_url.query)
    
    if 'season_nameid' in query_params:
        return query_params['season_nameid'][0]
    return None

def extract_match_data(table, home_team, match_date, season_id):
    rows = table.find_all('tr')
    if len(rows) < 3:  # Need at least header + team header + one player row
        return []
    
    # Extract away team from header row
    header_row = rows[0]
    header_cells = header_row.find_all('td')
    if len(header_cells) < 2:
        return []
    
    header_text = header_cells[0].text.strip()
    away_team_match = re.search(r'vs\.\s+(.+)', header_text)
    if not away_team_match:
        return []
    
    away_team = away_team_match.group(1).strip()
    
    # Process player rows (skip header rows)
    matches = []
    for row in rows[2:-1]:  # Skip header rows and totals row
        cells = row.find_all('td')
        if len(cells) != 6:
            continue
        
        # Skip if this is the totals row
        if "TOTALS" in cells[0].text.strip():
            continue
        
        home_player = cells[0].text.strip()
        home_hcp = cells[1].text.strip()
        home_score = cells[2].text.strip()
        away_player = cells[3].text.strip()
        away_hcp = cells[4].text.strip()
        away_score = cells[5].text.strip()
        
        # Skip empty rows
        if not home_player or not away_player:
            continue
        
        # Convert to integers where needed
        try:
            home_hcp = int(home_hcp)
            home_score = int(home_score)
            away_hcp = int(away_hcp)
            away_score = int(away_score)
        except ValueError:
            # If conversion fails, skip this row
            continue
        
        # Determine winner
        forfeit = False
        if home_score > away_score:
            winner = home_player
            winner_team = home_team
            winner_hcp = home_hcp
        elif away_score > home_score:
            winner = away_player
            winner_team = away_team
            winner_hcp = away_hcp
        else:
            # In case of a tie, provide tie info
            winner = "Tie"
            winner_team = "Tie"
            winner_hcp = None
        
        # Check for forfeit (usually indicated by a 0 score)
        if home_score == 0 or away_score == 0:
            forfeit = True
        
        match_data = {
            "homeTeam": home_team,
            "awayTeam": away_team,
            "homePlayer": home_player,
            "homeHCP": home_hcp,
            "homeScore": home_score,
            "awayPlayer": away_player,
            "awayHCP": away_hcp,
            "awayScore": away_score,
            "date": match_date,
            "forfeit": forfeit,
            "winner": winner,
            "winnerTeam": winner_team,
            "winnerHCP": winner_hcp,
            "seasonId": season_id
        }
        
        matches.append(match_data)
    
    return matches

def scrape_team_data(team_info):
    team_name = team_info["name"]
    url = team_info["url"]
    
    # Extract season ID from URL
    season_id = extract_season_id(url)
    if not season_id:
        print(f"Warning: Could not extract season ID from URL for team {team_name}")
        season_id = "unknown"
    
    print(f"Scraping data for team: {team_name} (Season ID: {season_id})")
    
    try:
        # Use authenticated session with headers
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"Error accessing {url}: Status code {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try to extract season information from page content if available
        season_title = None
        h4_tags = soup.find_all('h4')
        for h4 in h4_tags:
            if 'Season' in h4.text:
                season_title = h4.text.strip()
                break
                
        # Extract match results tables
        match_tables = soup.find_all('table', {'class': 'tableteir2'})
        
        all_matches = []
        
        # Skip the first table (which is usually the schedule)
        for table in match_tables[1:]:
            # Get the match date from the header row
            header_row = table.find('tr')
            if not header_row:
                continue
            
            header_cells = header_row.find_all('td')
            if len(header_cells) < 2:
                continue
            
            match_date = header_cells[-1].text.strip()
            
            # Extract all matches from this table
            matches = extract_match_data(table, team_name, match_date, season_id)
            
            # Add season title if found
            if season_title:
                for match in matches:
                    match["seasonTitle"] = season_title
                    
            all_matches.extend(matches)
        
        return all_matches
    
    except Exception as e:
        print(f"Error processing {team_name}: {str(e)}")
        return []

def create_season_archive_info(current_season):
    """Create metadata JSON for the archived season"""
    return {
        "season": current_season['name'],
        "year": current_season['year'],
        "archived": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "final",
        "description": f"Final archive of {current_season['name']} {current_season['year']} season"
    }

def main():
    # Create output directory
    os.makedirs("public/data", exist_ok=True)
    
    # Create archives directory
    archives_dir = "public/data/archives"
    os.makedirs(archives_dir, exist_ok=True)
    
    # Determine current season
    current_season = determine_current_season()
    print(f"Current season: {current_season['name']} {current_season['year']}")
    
    # Verify authentication cookie is present
    if not AUTH_COOKIE:
        print("ERROR: Authentication cookie is missing. Please set the AUTH_COOKIE environment variable.")
        return
    
    all_matches = []
    
    for team_info in TEAMS:
        matches = scrape_team_data(team_info)
        all_matches.extend(matches)
        
        # Be nice to the server with a small delay
        time.sleep(1)
    
    # Save current season data
    current_season_str = f"{current_season['name'].lower()}_{current_season['year']}"
    
    # Latest version (this is always updated regardless of season ending)
    with open("public/data/all_matches_latest.json", 'w') as f:
        json.dump(all_matches, f, indent=2)
    
    # Save current season version
    current_season_file = f"public/data/all_matches_{current_season_str}.json"
    with open(current_season_file, 'w') as f:
        json.dump(all_matches, f, indent=2)
    
    # Check if the season is ending soon
    if is_season_ending_soon():
        print(f"NOTICE: The {current_season['name']} {current_season['year']} season is ending soon!")
        print("Creating final season archive...")
        
        # Create archive directory for this season if it doesn't exist
        season_archive_dir = f"{archives_dir}/{current_season_str}"
        os.makedirs(season_archive_dir, exist_ok=True)
        
        # Archive the data with FINAL tag
        archive_file = f"{season_archive_dir}/all_matches_FINAL.json"
        with open(archive_file, 'w') as f:
            json.dump(all_matches, f, indent=2)
        
        # Create metadata file with archive info
        archive_info = create_season_archive_info(current_season)
        with open(f"{season_archive_dir}/metadata.json", 'w') as f:
            json.dump(archive_info, f, indent=2)
        
        print(f"Final season data archived to {archive_file}")
    
    # Group matches by season
    seasons = {}
    for match in all_matches:
        season_id = match.get("seasonId", "unknown")
        if season_id not in seasons:
            seasons[season_id] = []
        seasons[season_id].append(match)
    
    # Save each season ID to a separate file
    for season_id, matches in seasons.items():
        # Latest version
        with open(f"data/season_{season_id}_matches_latest.json", 'w') as f:
            json.dump(matches, f, indent=2)
    
    # Print summary
    print(f"Scraping completed.")
    print(f"Total matches collected: {len(all_matches)}")
    print(f"Season IDs found: {list(seasons.keys())}")
    print(f"Data saved to:")
    print(f"  - data/all_matches_latest.json")
    print(f"  - {current_season_file}")
    for season_id in seasons.keys():
        print(f"  - data/season_{season_id}_matches_latest.json")
    
    if is_season_ending_soon():
        print(f"  - {archives_dir}/{current_season_str}/all_matches_FINAL.json (Season Archive)")

if __name__ == "__main__":
    main()
