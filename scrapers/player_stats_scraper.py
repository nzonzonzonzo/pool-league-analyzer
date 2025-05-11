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

def create_season_archive_info(current_season):
    """Create metadata JSON for the archived season"""
    return {
        "season": current_season['name'],
        "year": current_season['year'],
        "archived": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "final",
        "description": f"Final archive of {current_season['name']} {current_season['year']} season"
    }

def fetch_individual_standings():
    """Fetch the individual standings page"""
    print("Fetching individual standings page...")
    
    url = "https://leagues3.amsterdambilliards.com/8ball/abc/individual_standings.php"
    
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"Error accessing {url}: Status code {response.status_code}")
            return None
        
        return response.text
    except Exception as e:
        print(f"Error fetching individual standings: {str(e)}")
        return None

def extract_season_info(soup):
    """Extract the season information from the page"""
    season_info = {}
    
    # Find the season title
    title_element = soup.find('td', string=lambda text: text and 'Team 8-Ball League' in text)
    if title_element:
        title_text = title_element.get_text().strip()
        match = re.search(r'Team 8-Ball League - (.*?) Session', title_text)
        if match:
            season_info['session'] = match.group(1)
        
        # Get update timestamp
        match = re.search(r'Updated on (.*)', title_text)
        if match:
            season_info['updated'] = match.group(1)
    
    return season_info

def extract_player_stats(soup):
    """Extract player statistics from all teams in the standings"""
    all_players = []
    
    # Find all team tables
    team_tables = soup.find_all('table', {'class': 'tableteir2'})
    
    current_division = None
    
    for table in team_tables:
        # Check if this is a division header
        division_header = table.find('td', {'bgcolor': re.compile(r'#[A-F0-9]{6}')})
        if division_header and 'Division' in division_header.get_text():
            current_division = division_header.get_text().strip()
            continue
        
        # Check if this is a team table
        team_name_cell = table.find('td', {'class': 'data_level_1_nobg', 'style': re.compile('color:#970000')})
        if not team_name_cell:
            continue
        
        team_name = team_name_cell.text.strip()
        # Clean team name (remove extra spaces and text like "i" and "b")
        team_name = re.sub(r'\s+', ' ', team_name)
        team_name = re.sub(r'<[^>]+>', '', team_name).strip()
        
        # Get the rows for each player
        player_rows = []
        in_player_section = False
        for row in table.find_all('tr'):
            # Skip header rows
            if row.find('td', {'class': 'data_level_3'}):
                in_player_section = True
                continue
                
            if in_player_section and not row.find('td', {'colspan': '5'}):  # Not a totals row
                cells = row.find_all('td')
                if len(cells) >= 10 and cells[1].text.strip() != "":  # Valid player row
                    player_rows.append(row)
        
        # Extract data for each player
        for row in player_rows:
            cells = row.find_all('td')
            if len(cells) < 10:
                continue
                
            player_name = cells[1].text.strip()
            # Remove <b> tags if present
            player_name = re.sub(r'<[^>]+>', '', player_name).strip()
            
            handicap = cells[2].text.strip()
            wins = cells[5].text.strip()
            losses = cells[6].text.strip()
            total_games = cells[7].text.strip()
            
            try:
                handicap = int(handicap)
                wins = int(wins)
                losses = int(losses)
                total_games = int(total_games)
                win_percentage = round((wins / total_games) * 100, 1) if total_games > 0 else 0
            except ValueError:
                # If conversion fails, skip this row
                continue
            
            player_data = {
                "team": team_name,
                "name": player_name,
                "handicap": handicap,
                "wins": wins,
                "losses": losses,
                "total": total_games,
                "winPercentage": f"{win_percentage}%",
                "division": current_division
            }
            
            all_players.append(player_data)
    
    return all_players

def main():
    # Create output directory
    os.makedirs("data", exist_ok=True)
    
    # Create archives directory
    archives_dir = "data/archives"
    os.makedirs(archives_dir, exist_ok=True)
    
    # Determine current season
    current_season = determine_current_season()
    print(f"Current season: {current_season['name']} {current_season['year']}")
    
    # Verify authentication cookie is present
    if not AUTH_COOKIE:
        print("WARNING: Authentication cookie is missing. Results may be limited.")
    
    # Fetch individual standings page
    html_content = fetch_individual_standings()
    if not html_content:
        print("Failed to fetch individual standings page. Exiting.")
        return
    
    # Parse HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract season information
    season_info = extract_season_info(soup)
    print(f"Season: {season_info.get('session', 'Unknown')}")
    print(f"Last Updated: {season_info.get('updated', 'Unknown')}")
    
    # Extract player statistics
    players = extract_player_stats(soup)
    
    if not players:
        print("No player data found. Check the page structure or authentication.")
        return
    
    # Get current season as string
    current_season_str = f"{current_season['name'].lower()}_{current_season['year']}"
    
    # Save latest version (always updated regardless of season ending)
    with open("data/player_stats_latest.json", 'w') as f:
        json.dump(players, f, indent=2)
    
    # Group players by team
    teams = {}
    for player in players:
        team_name = player.get("team")
        if team_name not in teams:
            teams[team_name] = []
        teams[team_name].append(player)
    
    # Save each team to a separate file (latest version)
    for team_name, team_players in teams.items():
        # Create safe filename
        safe_team_name = re.sub(r'[^\w\s-]', '', team_name).strip().replace(' ', '_')
        
        # Latest version
        with open(f"data/team_{safe_team_name}_stats_latest.json", 'w') as f:
            json.dump(team_players, f, indent=2)
    
    # Save current season version
    current_season_file = f"data/player_stats_{current_season_str}.json"
    with open(current_season_file, 'w') as f:
        json.dump(players, f, indent=2)
        
    # Check if the season is ending soon
    if is_season_ending_soon():
        print(f"NOTICE: The {current_season['name']} {current_season['year']} season is ending soon!")
        print("Creating final season archive...")
        
        # Create archive directory for this season if it doesn't exist
        season_archive_dir = f"{archives_dir}/{current_season_str}"
        os.makedirs(season_archive_dir, exist_ok=True)
        
        # Archive the data with FINAL tag
        archive_file = f"{season_archive_dir}/player_stats_FINAL.json"
        with open(archive_file, 'w') as f:
            json.dump(players, f, indent=2)
        
        # Create metadata file with archive info or update if exists
        metadata_file = f"{season_archive_dir}/metadata.json"
        if os.path.exists(metadata_file):
            # Update existing metadata
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
            metadata['player_stats_archived'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        else:
            # Create new metadata
            metadata = create_season_archive_info(current_season)
            metadata['player_stats_archived'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Final season player stats archived to {archive_file}")
        
        # Also archive team-specific files in the archive directory
        for team_name, team_players in teams.items():
            safe_team_name = re.sub(r'[^\w\s-]', '', team_name).strip().replace(' ', '_')
            team_archive_file = f"{season_archive_dir}/team_{safe_team_name}_stats_FINAL.json"
            with open(team_archive_file, 'w') as f:
                json.dump(team_players, f, indent=2)
    
    # Print summary
    print(f"Scraping completed.")
    print(f"Total players collected: {len(players)}")
    print(f"Total teams found: {len(teams)}")
    print(f"Data saved to:")
    print(f"  - data/player_stats_latest.json")
    print(f"  - {current_season_file}")
    
    for team_name in teams.keys():
        safe_team_name = re.sub(r'[^\w\s-]', '', team_name).strip().replace(' ', '_')
        print(f"  - data/team_{safe_team_name}_stats_latest.json")
        
    if is_season_ending_soon():
        print(f"  - {archives_dir}/{current_season_str}/player_stats_FINAL.json (Season Archive)")
        print(f"  - {archives_dir}/{current_season_str}/metadata.json")

if __name__ == "__main__":
    main()
