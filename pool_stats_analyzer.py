class PoolMatchupAnalyzer:
    """Analyzes player matchups and provides a user-friendly interface."""
    
    def __init__(self, data_file='pool_stats.json'):
        """Initialize with scraped data file."""
        self.data_file = data_file
        self.teams_data = {}
        self.players_data = {}
        self.load_data()
        
    def load_data(self):
        """Load data from the JSON file."""
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r') as f:
                data = json.load(f)
                
            self.teams_data = data.get('teams', {})
            self.players_data = data.get('players', {})
            
            print(f"Loaded data from {self.data_file}")
            scraped_date = data.get('scraped_date', 'unknown')
            print(f"Data scraped on: {scraped_date}")
            
            return True
        else:
            print(f"File not found: {self.data_file}")
            return False
    
    def find_team(self, team_name):
        """Find a team ID by name (case-insensitive, partial match)."""
        team_name_lower = team_name.lower()
        
        # Try exact match first (case-insensitive)
        for team_id, team_info in self.teams_data.items():
            if team_info['name'].lower() == team_name_lower:
                return team_id
        
        # If no exact match, try partial match
        for team_id, team_info in self.teams_data.items():
            if team_name_lower in team_info['name'].lower():
                return team_id
        
        return None
    
    def get_teams_list(self):
        """Return a list of team names."""
        return [team_info['name'] for team_info in self.teams_data.values()]
    
    def get_team_players(self, team_name):
        """Return a list of players for a specific team."""
        team_id = self.find_team(team_name)
        
        if team_id:
            return list(self.teams_data[team_id]['players'].keys())
        
        return []
    
    def analyze_matchup(self, our_team, opponent_team):
        """Analyze all possible matchups between two teams."""
        our_team_id = self.find_team(our_team)
        opponent_team_id = self.find_team(opponent_team)
        
        if not our_team_id or not opponent_team_id:
            missing = []
            if not our_team_id:
                missing.append(our_team)
            if not opponent_team_id:
                missing.append(opponent_team)
                
            print(f"Could not find team(s): {', '.join(missing)}")
            return None
            
        our_players = self.teams_data[our_team_id]['players']
        opponent_players = self.teams_data[opponent_team_id]['players']
        
        # Calculate all matchup odds
        matchup_odds = {}
        for our_player, our_data in our_players.items():
            matchup_odds[our_player] = {}
            
            for opp_player, opp_data in opponent_players.items():
                our_handicap
                
                # Calculate win probability based on historical performance
                # against this handicap differential
                win_prob = self._calculate_win_probability(our_data, opp_data, handicap_diff)
                
                matchup_odds[our_player][opp_player] = {
                    'our_handicap': our_handicap,
                    'opponent_handicap': opp_handicap,
                    'handicap_diff': handicap_diff,
                    'win_probability': win_prob
                }
        
        return matchup_odds
    
    def _calculate_win_probability(self, our_data, opp_data, handicap_diff):
        """Calculate win probability based on historical performance."""
        handicap_key = f"{'+' if handicap_diff > 0 else ''}{handicap_diff}"
        
        # Check if we have data for this specific handicap differential
        if 'handicap_performance' in our_data and handicap_key in our_data['handicap_performance']:
            perf = our_data['handicap_performance'][handicap_key]
            total_games = perf['games_won'] + perf['games_lost']
            
            if total_games > 0:
                base_prob = perf['games_won'] / total_games
            else:
                # Fall back to overall performance
                total_overall = our_data['games_won'] + our_data['games_lost']
                base_prob = our_data['games_won'] / total_overall if total_overall > 0 else 0.5
        else:
            # Fall back to overall performance
            total_overall = our_data.get('games_won', 0) + our_data.get('games_lost', 0)
            base_prob = our_data.get('games_won', 0) / total_overall if total_overall > 0 else 0.5
        
        # Adjust based on opponent's strength
        opp_total = opp_data.get('games_won', 0) + opp_data.get('games_lost', 0)
        if opp_total > 0:
            opp_win_rate = opp_data.get('games_won', 0) / opp_total
            
            # Simple adjustment formula: if opponent is strong, slightly decrease our odds
            adjustment = (opp_win_rate - 0.5) * 0.4  # 0.4 is a dampening factor
            adjusted_prob = base_prob - adjustment
        else:
            adjusted_prob = base_prob
        
        # Ensure probability is within reasonable bounds
        return max(0.1, min(0.9, adjusted_prob))
    
    def get_optimal_lineup(self, our_team, opponent_team, opponent_lineup=None):
        """
        Calculate the optimal lineup for our team against an opponent team.
        
        If opponent_lineup is provided, optimize against that specific lineup.
        Otherwise, optimize against the opponent's most likely lineup.
        """
        matchup_odds = self.analyze_matchup(our_team, opponent_team)
        if not matchup_odds:
            return None
            
        our_players = list(matchup_odds.keys())
        
        if opponent_lineup:
            # Use the provided opponent lineup
            opponent_players = opponent_lineup
        else:
            # Use all available opponent players
            opponent_players = []
            for player_dict in matchup_odds.values():
                opponent_players.extend(list(player_dict.keys()))
            opponent_players = list(set(opponent_players))  # Remove duplicates
        
        # Filter out players with no matchup data
        valid_our_players = []
        for our_player in our_players:
            if any(opp in matchup_odds[our_player] for opp in opponent_players):
                valid_our_players.append(our_player)
        
        if not valid_our_players:
            print("No valid matchups found. Insufficient data.")
            return None
            
        our_players = valid_our_players
        
        # Create a matrix of win probabilities
        probability_matrix = {}
        for our_player in our_players:
            probability_matrix[our_player] = {}
            for opp_player in opponent_players:
                if opp_player in matchup_odds[our_player]:
                    probability_matrix[our_player][opp_player] = matchup_odds[our_player][opp_player]['win_probability']
                else:
                    probability_matrix[our_player][opp_player] = 0.5  # Default 50% if no data
        
        # Use Hungarian algorithm for optimal assignment to maximize overall win probability
        # This is a classic maximum-weight assignment problem
        try:
            import numpy as np
            from scipy.optimize import linear_sum_assignment
            
            # Convert to numpy array for the algorithm
            matrix_values = []
            for our_player in our_players:
                row = []
                for opp_player in opponent_players:
                    row.append(probability_matrix[our_player][opp_player])
                matrix_values.append(row)
            
            # Convert to numpy array
            cost_matrix = np.array(matrix_values)
            
            # Negative cost because we want to maximize probability, not minimize
            row_ind, col_ind = linear_sum_assignment(-cost_matrix)
            
            # Create the optimal lineup
            optimal_lineup = []
            total_probability = 0
            
            for i, j in zip(row_ind, col_ind):
                if j < len(opponent_players):  # Ensure we don't go out of bounds
                    our_player = our_players[i]
                    opp_player = opponent_players[j]
                    
                    if opp_player in matchup_odds[our_player]:
                        optimal_lineup.append({
                            'our_player': our_player,
                            'opponent': opp_player,
                            'win_probability': cost_matrix[i, j],
                            'our_handicap': matchup_odds[our_player][opp_player]['our_handicap'],
                            'opponent_handicap': matchup_odds[our_player][opp_player]['opponent_handicap'],
                            'handicap_diff': matchup_odds[our_player][opp_player]['handicap_diff']
                        })
                        total_probability += cost_matrix[i, j]
            
            return {
                'lineup': optimal_lineup,
                'expected_win_probability': total_probability / len(optimal_lineup) if optimal_lineup else 0
            }
            
        except (ImportError, ModuleNotFoundError):
            print("SciPy not available for optimal lineup calculation.")
            print("Using a greedy approach instead.")
            
            # Greedy approach as fallback
            available_opponents = opponent_players.copy()
            optimal_lineup = []
            
            # Sort our players by average win probability (descending)
            player_avg_probs = {}
            for our_player in our_players:
                valid_probs = [probability_matrix[our_player][opp] for opp in opponent_players 
                              if opp in matchup_odds[our_player]]
                if valid_probs:
                    player_avg_probs[our_player] = sum(valid_probs) / len(valid_probs)
                else:
                    player_avg_probs[our_player] = 0.5
            
            our_players_sorted = sorted(
                our_players,
                key=lambda p: player_avg_probs[p],
                reverse=True
            )
            
            for our_player in our_players_sorted:
                if not available_opponents:
                    break
                
                # Find valid opponents for this player
                valid_opponents = [opp for opp in available_opponents if opp in matchup_odds[our_player]]
                
                if not valid_opponents:
                    continue
                    
                # Find opponent with highest win probability for this player
                best_opponent = max(
                    valid_opponents,
                    key=lambda opp: probability_matrix[our_player][opp]
                )
                
                optimal_lineup.append({
                    'our_player': our_player,
                    'opponent': best_opponent,
                    'win_probability': probability_matrix[our_player][best_opponent],
                    'our_handicap': matchup_odds[our_player][best_opponent]['our_handicap'],
                    'opponent_handicap': matchup_odds[our_player][best_opponent]['opponent_handicap'],
                    'handicap_diff': matchup_odds[our_player][best_opponent]['handicap_diff']
                })
                
                # Remove this opponent from available list
                available_opponents.remove(best_opponent)
            
            return {
                'lineup': optimal_lineup,
                'expected_win_probability': sum(match['win_probability'] for match in optimal_lineup) / len(optimal_lineup) if optimal_lineup else 0
            }
    
    def plot_player_performance(self, player_name):
        """Create a plot showing a player's performance against different handicap levels."""
        if player_name not in self.players_data:
            print(f"Player '{player_name}' not found in data")
            return None
            
        player_data = self.players_data[player_name]
        
        if 'handicap_performance' not in player_data or not player_data['handicap_performance']:
            print(f"No handicap performance data available for {player_name}")
            return None
            
        # Extract handicap differentials and win rates
        handicaps = []
        win_rates = []
        
        for handicap_key, performance in player_data['handicap_performance'].items():
            # Convert string handicap keys to numeric values
            try:
                handicap_diff = int(handicap_key)
            except ValueError:
                # Handle '+' prefix
                handicap_diff = int(handicap_key.replace('+', ''))
                
            total_games = performance['games_won'] + performance['games_lost']
            
            if total_games > 0:
                win_rate = performance['games_won'] / total_games
                handicaps.append(handicap_diff)
                win_rates.append(win_rate)
        
        # Sort by handicap differential
        sorted_data = sorted(zip(handicaps, win_rates))
        handicaps = [h for h, _ in sorted_data]
        win_rates = [w for _, w in sorted_data]
        
        return {
            'player': player_name,
            'handicap': player_data.get('handicap'),
            'handicaps': handicaps,
            'win_rates': win_rates,
            'total_games_won': player_data.get('games_won', 0),
            'total_games_lost': player_data.get('games_lost', 0),
            'total_games': player_data.get('games_won', 0) + player_data.get('games_lost', 0)
        } = our_data.get('handicap')
                opp_handicap = opp_data.get('handicap')
                
                if our_handicap is None or opp_handicap is None:
                    continue
                    
                handicap_diff = opp_handicap - our_"""
Pool League Stats Analyzer for Amsterdam Billiards
--------------------------------------------------
This script handles authentication, scrapes comprehensive player and team statistics,
processes game-level data, and calculates matchup probabilities based on player
performance against different handicap levels.
"""

import requests
import os
import json
import re
import sys
import subprocess
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from getpass import getpass

class PoolLeagueScraper:
    def __init__(self, base_url=None, cookie=None):
        """Initialize with the league website base URL and auth cookie."""
        self.base_url = base_url or "https://leagues2.amsterdambilliards.com/8ball/abc"
        self.cookie = cookie or "T8UID=qJy9wAvA%2B3sZ08JkrfHGxA%3D%3D"
        self.session = requests.Session()
        self.teams_data = {}
        self.players_data = {}
        self.handicap_matrix = {}
        
        # Set up session with authentication cookie
        self.session.headers.update({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Cookie': f'T8UID={self.cookie}'
        })
        
    def load_teams_from_file(self, filename):
        """Load team data from a text file with team names and URLs."""
        try:
            with open(filename, 'r') as f:
                lines = f.readlines()
                
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Parse the line to extract team name and URL
                parts = line.split('\t')
                if len(parts) == 2:
                    team_name = parts[0].strip()
                    team_url = parts[1].strip()
                    
                    # Extract team_id from URL
                    team_id_match = re.search(r'team_id=(\d+)', team_url)
                    if team_id_match:
                        team_id = team_id_match.group(1)
                        
                        self.teams_data[team_id] = {
                            'name': team_name,
                            'schedule_url': team_url,
                            'players': {}
                        }
            
            print(f"Successfully loaded {len(self.teams_data)} teams from {filename}")
            return True
        except Exception as e:
            print(f"Error loading teams from file: {e}")
            return False
        
    def scrape_team_scouting_report(self, team_id, url):
        """Scrape a team's scouting report page to extract player and match data."""
        try:
            print(f"Scraping team {team_id}: {self.teams_data[team_id]['name']}")
            
            # Use the session with the provided authentication cookie
            try:
                # Set up headers to mimic a browser, including the authentication cookie
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Connection': 'keep-alive',
                    'Cookie': f'T8UID={self.cookie}'
                }
                
                # Send request with appropriate headers
                response = self.session.get(url, headers=headers)
                
                if response.status_code != 200:
                    print(f"Failed to access team page for team {team_id}: {response.status_code}")
                    return False
                
                html_content = response.text
            except Exception as e:
                print(f"Error accessing team page: {e}")
                return False
            
            # Parse HTML content with BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Check if we got a valid page (not a login redirect)
            if 'login' in soup.text.lower() and 'password' in soup.text.lower():
                print(f"Authentication failed for team {team_id}. Check your cookie.")
                return False
            
            # Extract team information - team name is in h4 tag
            team_name_elem = soup.find('h4')
            if team_name_elem:
                # Format: "Team Scouting Report - TEAM NAME"
                team_name_text = team_name_elem.text.strip()
                if '-' in team_name_text:
                    team_name = team_name_text.split('-')[1].strip()
                    self.teams_data[team_id]['name'] = team_name
            
            # Find all match tables - they have class="tableteir2" and width="80%"
            match_tables = soup.find_all('table', {'class': 'tableteir2', 'width': '80%'})
            
            # We'll collect all the players on this team first from the match tables
            team_players = set()
            
            # Process each match table
            for match_table in match_tables:
                # Get the match heading (first row with team names and date)
                match_heading = match_table.find('tr')
                if not match_heading:
                    continue
                
                heading_cols = match_heading.find_all('td')
                if len(heading_cols) < 6:
                    continue
                
                # Extract match date and opponent team
                match_date = heading_cols[-1].text.strip()
                match_info = heading_cols[0].text.strip()
                
                # Format: "TEAM NAME vs. OPPONENT TEAM"
                teams_parts = match_info.split('vs.')
                if len(teams_parts) != 2:
                    continue
                    
                our_team_name = teams_parts[0].strip()
                opponent_team = teams_parts[1].strip()
                
                # Get the column headers (second row)
                header_row = match_table.find_all('tr')[1] if len(match_table.find_all('tr')) > 1 else None
                if not header_row:
                    continue
                    
                # Make sure it has the expected headers: Player, HCP, Games, Opponent, HCP, Games
                headers = [h.text.strip().lower() for h in header_row.find_all('td', {'class': 'level_1'})]
                if len(headers) < 6 or 'player' not in headers[0] or 'opponent' not in headers[3]:
                    continue
                
                # Skip the totals row at the end
                data_rows = match_table.find_all('tr')[2:-1]  # Skip header rows and last row (totals)
                
                # Process each match row
                for row in data_rows:
                    cols = row.find_all('td')
                    if len(cols) < 6:
                        continue
                        
                    # Extract player data
                    # Player name is in <p> inside <center> inside <td>
                    player_elem = cols[0].find('p')
                    our_player = player_elem.text.strip() if player_elem else cols[0].text.strip()
                    
                    # Clean up any extraneous whitespace in player name
                    our_player = ' '.join(our_player.split())
                    
                    # Add to our team players set
                    if our_player.lower() != 'totals':
                        team_players.add(our_player)
                    
                    # Extract handicaps and game results
                    try:
                        our_handicap = int(cols[1].text.strip())
                    except ValueError:
                        our_handicap = None
                    
                    try:
                        games_won = int(cols[2].text.strip())
                    except ValueError:
                        games_won = 0
                        
                    opponent_elem = cols[3].find('p') if cols[3].find('p') else cols[3]
                    opponent = opponent_elem.text.strip()
                    
                    try:
                        opponent_handicap = int(cols[4].text.strip())
                    except ValueError:
                        opponent_handicap = None
                        
                    try:
                        games_lost = int(cols[5].text.strip())
                    except ValueError:
                        games_lost = 0
                    
                    # Initialize player data if not already present
                    if our_player.lower() != 'totals' and our_player not in self.teams_data[team_id]['players']:
                        self.teams_data[team_id]['players'][our_player] = {
                            'handicap': our_handicap,
                            'matches': [],
                            'games_won': 0,
                            'games_lost': 0,
                            'handicap_performance': {}
                        }
                    
                    # Update player data with this match
                    if our_player.lower() != 'totals':
                        player_data = self.teams_data[team_id]['players'][our_player]
                        
                        # Update handicap if needed
                        if player_data['handicap'] is None and our_handicap is not None:
                            player_data['handicap'] = our_handicap
                        
                        # Update game counts
                        player_data['games_won'] += games_won
                        player_data['games_lost'] += games_lost
                        
                        # Track performance against this handicap level
                        if our_handicap is not None and opponent_handicap is not None:
                            handicap_diff = opponent_handicap - our_handicap
                            handicap_key = f"{'+' if handicap_diff > 0 else ''}{handicap_diff}"
                            
                            if handicap_key not in player_data['handicap_performance']:
                                player_data['handicap_performance'][handicap_key] = {
                                    'games_won': 0,
                                    'games_lost': 0
                                }
                            
                            player_data['handicap_performance'][handicap_key]['games_won'] += games_won
                            player_data['handicap_performance'][handicap_key]['games_lost'] += games_lost
                        
                        # Add detailed match record
                        player_data['matches'].append({
                            'date': match_date,
                            'opponent_team': opponent_team,
                            'opponent': opponent,
                            'opponent_handicap': opponent_handicap,
                            'handicap_diff': (opponent_handicap - our_handicap) if our_handicap is not None and opponent_handicap is not None else None,
                            'games_won': games_won,
                            'games_lost': games_lost
                        })
            
            # If no players were found in match tables, look for a roster table
            if not team_players:
                print(f"No match data found for team {team_id}, looking for roster table...")
                
                # Try to find a roster table (if there is one)
                roster_tables = soup.find_all('table')
                for table in roster_tables:
                    # Check if this looks like a roster table
                    headers = table.find_all('th')
                    header_text = ' '.join([h.text.strip().lower() for h in headers])
                    
                    if 'player' in header_text and 'handicap' in header_text:
                        # This looks like a roster table
                        for row in table.find_all('tr')[1:]:  # Skip header row
                            cols = row.find_all('td')
                            if len(cols) >= 2:
                                player_name = cols[0].text.strip()
                                
                                try:
                                    handicap = int(cols[1].text.strip())
                                except ValueError:
                                    handicap = None
                                
                                # Add player to roster
                                self.teams_data[team_id]['players'][player_name] = {
                                    'handicap': handicap,
                                    'matches': [],
                                    'games_won': 0,
                                    'games_lost': 0,
                                    'handicap_performance': {}
                                }
            
            print(f"Found {len(self.teams_data[team_id]['players'])} players for team {team_id}")
            return True
                
        except Exception as e:
            print(f"Error scraping team page for team {team_id}: {e}")
            return False

    def scrape_teams(self):
        """Scrape data for all teams."""
        success_count = 0
        
        for team_id, team_info in self.teams_data.items():
            if 'schedule_url' in team_info:
                if self.scrape_team_scouting_report(team_id, team_info['schedule_url']):
                    success_count += 1
        
        print(f"Successfully scraped data for {success_count} out of {len(self.teams_data)} teams")
        return success_count > 0
    
    def consolidate_player_data(self):
        """Consolidate player data across all teams."""
        all_players = {}
        
        for team_id, team_info in self.teams_data.items():
            for player_name, player_data in team_info['players'].items():
                if player_name not in all_players:
                    all_players[player_name] = player_data.copy()
                else:
                    # Merge data if player appears on multiple teams
                    existing_player = all_players[player_name]
                    existing_player['games_won'] += player_data['games_won']
                    existing_player['games_lost'] += player_data['games_lost']
                    existing_player['matches'].extend(player_data['matches'])
                    
                    # Merge handicap performance data
                    for handicap_key, performance in player_data['handicap_performance'].items():
                        if handicap_key not in existing_player['handicap_performance']:
                            existing_player['handicap_performance'][handicap_key] = performance.copy()
                        else:
                            existing_player['handicap_performance'][handicap_key]['games_won'] += performance['games_won']
                            existing_player['handicap_performance'][handicap_key]['games_lost'] += performance['games_lost']
        
        self.players_data = all_players
        print(f"Successfully compiled data for {len(self.players_data)} players")
        return True
    
    def scrape_schedule_page(self, team_id, schedule_url):
        """Scrape a team's schedule page to extract match and game-level data."""
        try:
            response = self.session.get(schedule_url)
            if response.status_code != 200:
                print(f"Failed to access schedule page for team {team_id}: {response.status_code}")
                return False
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all match records on the schedule page
            # This will need to be customized based on the actual website structure
            match_elements = soup.find_all('div', class_='match-record') or \
                            soup.find_all('tr', class_='match-row') or \
                            soup.find_all('div', class_='match')
                            
            if not match_elements:
                # Fall back to tables that might contain match data
                tables = soup.find_all('table')
                for table in tables:
                    if any(keyword in str(table).lower() for keyword in ['match', 'game', 'result']):
                        match_elements = table.find_all('tr')[1:]  # Skip header row
                        break
            
            # Process each match
            for match_elem in match_elements:
                # Extract match date, opponent team, and overall result
                # These selectors will need to be customized
                match_date_elem = match_elem.find('span', class_='match-date') or \
                                match_elem.find('td', class_='date')
                match_date = match_date_elem.text.strip() if match_date_elem else "Unknown"
                
                # Find individual player matches within this team match
                player_matches = match_elem.find_all('div', class_='player-match') or \
                                match_elem.find_all('tr', class_='player-match')
                
                # Process each player's individual match
                for player_match in player_matches:
                    # Extract our player name, opponent name, handicaps, and game results
                    our_player_elem = player_match.find('span', class_='our-player') or \
                                    player_match.find('td', class_='home-player')
                    opponent_elem = player_match.find('span', class_='opponent') or \
                                    player_match.find('td', class_='away-player')
                    
                    our_handicap_elem = player_match.find('span', class_='our-handicap') or \
                                        player_match.find('td', class_='home-handicap')
                    opponent_handicap_elem = player_match.find('span', class_='opponent-handicap') or \
                                            player_match.find('td', class_='away-handicap')
                    
                    games_result_elem = player_match.find('span', class_='games-result') or \
                                        player_match.find('td', class_='games')
                    
                    # Extract the text data
                    if our_player_elem and opponent_elem:
                        our_player = our_player_elem.text.strip()
                        opponent = opponent_elem.text.strip()
                        our_handicap = int(our_handicap_elem.text.strip()) if our_handicap_elem else None
                        opponent_handicap = int(opponent_handicap_elem.text.strip()) if opponent_handicap_elem else None
                        
                        # Parse game results - format will depend on the website
                        games_won = 0
                        games_lost = 0
                        
                        if games_result_elem:
                            games_text = games_result_elem.text.strip()
                            # Example: "3-1" means 3 games won, 1 game lost
                            if '-' in games_text:
                                parts = games_text.split('-')
                                try:
                                    games_won = int(parts[0].strip())
                                    games_lost = int(parts[1].strip())
                                except ValueError:
                                    pass
                        
                        # Store this player's match data
                        if our_player not in self.teams_data[team_id]['players']:
                            self.teams_data[team_id]['players'][our_player] = {
                                'handicap': our_handicap,
                                'matches': [],
                                'games_won': 0,
                                'games_lost': 0,
                                'handicap_performance': {}  # Performance against different handicaps
                            }
                        
                        # Add this match to the player's history
                        player_data = self.teams_data[team_id]['players'][our_player]
                        player_data['games_won'] += games_won
                        player_data['games_lost'] += games_lost
                        
                        # Track performance against this handicap level
                        handicap_diff = opponent_handicap - our_handicap if our_handicap and opponent_handicap else 0
                        handicap_key = f"{'+' if handicap_diff > 0 else ''}{handicap_diff}"
                        
                        if handicap_key not in player_data['handicap_performance']:
                            player_data['handicap_performance'][handicap_key] = {
                                'games_won': 0,
                                'games_lost': 0
                            }
                        
                        player_data['handicap_performance'][handicap_key]['games_won'] += games_won
                        player_data['handicap_performance'][handicap_key]['games_lost'] += games_lost
                        
                        # Add detailed match record
                        player_data['matches'].append({
                            'date': match_date,
                            'opponent': opponent,
                            'opponent_handicap': opponent_handicap,
                            'handicap_diff': handicap_diff,
                            'games_won': games_won,
                            'games_lost': games_lost
                        })
            
            return True
                
        except Exception as e:
            print(f"Error scraping schedule page for team {team_id}: {e}")
            return False
    
    def scrape_players(self):
        """Scrape player data from all team schedule pages."""
        try:
            for team_id, team_info in self.teams_data.items():
                if 'schedule_url' in team_info:
                    print(f"Scraping schedule for team {team_id}: {team_info['name']}")
                    self.scrape_schedule_page(team_id, team_info['schedule_url'])
                
            # After scraping all teams, consolidate player data
            all_players = {}
            
            for team_id, team_info in self.teams_data.items():
                for player_name, player_data in team_info['players'].items():
                    if player_name not in all_players:
                        all_players[player_name] = player_data
                    else:
                        # Merge data if player appears on multiple teams
                        existing_player = all_players[player_name]
                        existing_player['games_won'] += player_data['games_won']
                        existing_player['games_lost'] += player_data['games_lost']
                        existing_player['matches'].extend(player_data['matches'])
                        
                        # Merge handicap performance data
                        for handicap_key, performance in player_data['handicap_performance'].items():
                            if handicap_key not in existing_player['handicap_performance']:
                                existing_player['handicap_performance'][handicap_key] = performance
                            else:
                                existing_player['handicap_performance'][handicap_key]['games_won'] += performance['games_won']
                                existing_player['handicap_performance'][handicap_key]['games_lost'] += performance['games_lost']
            
            self.players_data = all_players
            print(f"Successfully compiled data for {len(self.players_data)} players")
            return True
                
        except Exception as e:
            print(f"Error consolidating player data: {e}")
            return False
                                    player_name = cols[1