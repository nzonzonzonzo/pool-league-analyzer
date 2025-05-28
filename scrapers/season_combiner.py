import os
import json
import glob
from datetime import datetime, timedelta
import re
import math

class SeasonDataCombiner:
    def __init__(self, data_dir="public/data", archives_dir="public/data/archives"):
        self.data_dir = data_dir
        self.archives_dir = archives_dir
        self.available_seasons = []
        self.discover_available_seasons()
        
    def discover_available_seasons(self):
        """Discover all available seasons in the archives directory"""
        # Look for season directories in the archives folder
        season_dirs = glob.glob(f"{self.archives_dir}/*_*/")
        
        for season_dir in season_dirs:
            # Check if this is a valid season directory with metadata
            metadata_path = os.path.join(season_dir, "metadata.json")
            if os.path.exists(metadata_path):
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                    
                    season_name = metadata.get('season')
                    season_year = metadata.get('year')
                    
                    if season_name and season_year:
                        dir_name = os.path.basename(os.path.normpath(season_dir))
                        matches_path = os.path.join(season_dir, "all_matches_FINAL.json")
                        player_stats_path = os.path.join(season_dir, "player_stats_FINAL.json")
                        
                        has_matches = os.path.exists(matches_path)
                        has_stats = os.path.exists(player_stats_path)
                        
                        if has_matches or has_stats:
                            self.available_seasons.append({
                                'name': season_name,
                                'year': season_year,
                                'dir': dir_name,
                                'metadata': metadata,
                                'has_matches': has_matches,
                                'has_stats': has_stats,
                                'matches_path': matches_path if has_matches else None,
                                'player_stats_path': player_stats_path if has_stats else None
                            })
                except Exception as e:
                    print(f"Error processing {season_dir}: {str(e)}")
        
        # Sort seasons chronologically
        self.available_seasons.sort(key=lambda x: (x['year'], self._season_index(x['name'])))
        
        # Add current season if available
        current_matches_path = os.path.join(self.data_dir, "all_matches_latest.json")
        current_stats_path = os.path.join(self.data_dir, "player_stats_latest.json")
        
        if os.path.exists(current_matches_path) or os.path.exists(current_stats_path):
            self.available_seasons.append({
                'name': 'Current',
                'year': datetime.now().year,
                'dir': 'current',
                'metadata': {'status': 'active'},
                'has_matches': os.path.exists(current_matches_path),
                'has_stats': os.path.exists(current_stats_path),
                'matches_path': current_matches_path if os.path.exists(current_matches_path) else None,
                'player_stats_path': current_stats_path if os.path.exists(current_stats_path) else None
            })
    
    def _season_index(self, season_name):
        """Helper to convert season name to a numeric index for sorting"""
        if season_name.lower() == 'spring':
            return 1
        elif season_name.lower() == 'summer':
            return 2
        elif season_name.lower() == 'fall':
            return 3
        return 0  # Default for 'Current' or unknown
    
    def list_available_seasons(self):
        """List all available season data"""
        if not self.available_seasons:
            print("No season data found in archives.")
            return
            
        print(f"\n{'=' * 50}")
        print("AVAILABLE SEASONS:")
        print(f"{'=' * 50}")
        
        for i, season in enumerate(self.available_seasons):
            status = season['metadata'].get('status', 'unknown')
            print(f"{i+1}. {season['name']} {season['year']} ({status})")
            print(f"   Has match data: {season['has_matches']}")
            print(f"   Has player stats: {season['has_stats']}")
        
        print(f"{'=' * 50}\n")
    
    def load_season_data(self, season_index=None):
        """Load data for a specific season or all seasons if None"""
        if not self.available_seasons:
            print("No season data available.")
            return None, None
            
        if season_index is not None:
            if 0 <= season_index < len(self.available_seasons):
                season = self.available_seasons[season_index]
                matches = self._load_matches(season['matches_path']) if season['has_matches'] else []
                stats = self._load_stats(season['player_stats_path']) if season['has_stats'] else []
                return matches, stats
            else:
                print(f"Invalid season index: {season_index}")
                return None, None
        
        # Load all seasons
        all_matches = []
        all_stats = []
        
        for season in self.available_seasons:
            if season['has_matches']:
                matches = self._load_matches(season['matches_path'])
                # Add season metadata to each match
                for match in matches:
                    match['season_name'] = season['name']
                    match['season_year'] = season['year']
                all_matches.extend(matches)
            
            if season['has_stats']:
                stats = self._load_stats(season['player_stats_path'])
                # Add season metadata to each player stat
                for stat in stats:
                    stat['season_name'] = season['name']
                    stat['season_year'] = season['year']
                all_stats.extend(stats)
        
        return all_matches, all_stats
    
    def _load_matches(self, path):
        """Load match data from file"""
        if not path or not os.path.exists(path):
            return []
            
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading matches from {path}: {str(e)}")
            return []
    
    def _load_stats(self, path):
        """Load player stats from file"""
        if not path or not os.path.exists(path):
            return []
            
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading stats from {path}: {str(e)}")
            return []
    
    def generate_player_history(self):
        """Generate a comprehensive player history across all seasons"""
        all_matches, all_stats = self.load_season_data()
        if not all_matches and not all_stats:
            print("No data available to generate player history.")
            return None
            
        # Group match data by player
        player_matches = {}
        
        for match in all_matches:
            # Process home player
            home_player = match.get('homePlayer')
            if home_player:
                if home_player not in player_matches:
                    player_matches[home_player] = []
                
                player_matches[home_player].append({
                    'opponent': match.get('awayPlayer'),
                    'player_team': match.get('homeTeam'),
                    'opponent_team': match.get('awayTeam'),
                    'player_hcp': match.get('homeHCP'),
                    'player_score': match.get('homeScore'),
                    'opponent_score': match.get('awayScore'),
                    'win': match.get('winner') == home_player,
                    'forfeit': match.get('forfeit', False),
                    'date': match.get('date'),
                    'season_name': match.get('season_name'),
                    'season_year': match.get('season_year')
                })
            
            # Process away player
            away_player = match.get('awayPlayer')
            if away_player:
                if away_player not in player_matches:
                    player_matches[away_player] = []
                
                player_matches[away_player].append({
                    'opponent': match.get('homePlayer'),
                    'player_team': match.get('awayTeam'),
                    'opponent_team': match.get('homeTeam'),
                    'player_hcp': match.get('awayHCP'),
                    'player_score': match.get('awayScore'),
                    'opponent_score': match.get('homeScore'),
                    'win': match.get('winner') == away_player,
                    'forfeit': match.get('forfeit', False),
                    'date': match.get('date'),
                    'season_name': match.get('season_name'),
                    'season_year': match.get('season_year')
                })
        
        # Group stats by player
        player_stats = {}
        
        for stat in all_stats:
            player_name = stat.get('name')
            if not player_name:
                continue
                
            if player_name not in player_stats:
                player_stats[player_name] = []
            
            player_stats[player_name].append({
                'team': stat.get('team'),
                'handicap': stat.get('handicap'),
                'wins': stat.get('wins'),
                'losses': stat.get('losses'),
                'total': stat.get('total'),
                'win_percentage': stat.get('winPercentage'),
                'division': stat.get('division'),
                'season_name': stat.get('season_name'),
                'season_year': stat.get('season_year')
            })
        
        # Combine matches and stats for each player
        player_history = {}
        
        # Process all players from both matches and stats
        all_players = set(list(player_matches.keys()) + list(player_stats.keys()))
        
        for player_name in all_players:
            matches = player_matches.get(player_name, [])
            stats = player_stats.get(player_name, [])
            
            # Sort matches by date (if available)
            matches.sort(key=lambda x: x.get('date', '0000-00-00'))
            
            # Sort stats by season year and season index
            stats.sort(key=lambda x: (x.get('season_year', 0), self._season_index(x.get('season_name', ''))))
            
            # Calculate trends for handicap
            handicap_trend = self._calculate_handicap_trend(stats)
            
            # Calculate win percentage trend
            recent_win_percentage = self._calculate_recent_win_percentage(matches)
            
            # Track team changes
            team_history = self._track_team_history(stats, matches)
            
            # Calculate ELO-like rating based on match performance
            elo_rating, rating_trend = self._calculate_player_rating(matches)
            
            player_history[player_name] = {
                'name': player_name,
                'matches': matches,
                'stats': stats,
                'handicap_trend': handicap_trend,
                'recent_win_percentage': recent_win_percentage,
                'team_history': team_history,
                'elo_rating': elo_rating,
                'rating_trend': rating_trend,
                'current_team': team_history[-1] if team_history else None,
                'current_handicap': stats[-1].get('handicap') if stats else None,
                'handicap_changed_recently': self._has_handicap_changed_recently(stats),
                'seasons_played': len(set([(s.get('season_name'), s.get('season_year')) for s in stats]))
            }
        
        return player_history
    
    def _calculate_handicap_trend(self, stats):
        """Calculate handicap trend over time"""
        if not stats or len(stats) < 2:
            return 'stable'
            
        # Get handicaps in chronological order
        handicaps = [s.get('handicap') for s in stats if s.get('handicap') is not None]
        
        if not handicaps or len(handicaps) < 2:
            return 'stable'
            
        # Check if trending up or down
        if handicaps[-1] > handicaps[0]:
            return 'increasing'
        elif handicaps[-1] < handicaps[0]:
            return 'decreasing'
        return 'stable'
    
    def _has_handicap_changed_recently(self, stats):
        """Check if handicap has changed in the most recent season"""
        if not stats or len(stats) < 2:
            return False
            
        # Get the two most recent stats
        recent_stats = sorted(stats, key=lambda x: (x.get('season_year', 0), self._season_index(x.get('season_name', ''))))[-2:]
        
        if len(recent_stats) < 2:
            return False
            
        return recent_stats[0].get('handicap') != recent_stats[1].get('handicap')
    
    def _calculate_recent_win_percentage(self, matches, recent_matches=10):
        """Calculate win percentage for recent matches"""
        if not matches:
            return 0
            
        # Filter out forfeit matches
        valid_matches = [m for m in matches if not m.get('forfeit', False)]
        
        if not valid_matches:
            return 0
            
        # Get most recent matches
        recent = valid_matches[-min(recent_matches, len(valid_matches)):]
        
        if not recent:
            return 0
            
        wins = sum(1 for m in recent if m.get('win', False))
        return (wins / len(recent)) * 100
    
    def _track_team_history(self, stats, matches):
        """Track player's team history"""
        team_history = []
        
        # First, try to extract from stats which has explicit team info
        if stats:
            for stat in stats:
                team = stat.get('team')
                if team and (not team_history or team_history[-1] != team):
                    team_history.append(team)
        
        # If no teams found in stats, try matches
        if not team_history and matches:
            seen_teams = set()
            for match in matches:
                team = match.get('player_team')
                if team and team not in seen_teams:
                    seen_teams.add(team)
                    team_history.append(team)
        
        return team_history
    
    def _calculate_player_rating(self, matches, base_rating=1500, k_factor=32):
        """Calculate an ELO-like rating based on match history"""
        if not matches:
            return base_rating, 'stable'
            
        # Filter out forfeit matches
        valid_matches = [m for m in matches if not m.get('forfeit', False)]
        
        if not valid_matches:
            return base_rating, 'stable'
            
        # Start with base rating
        rating = base_rating
        rating_history = [base_rating]
        
        for match in valid_matches:
            # Simple win/loss rating adjustment
            if match.get('win', False):
                rating += k_factor
            else:
                rating -= k_factor
            
            rating_history.append(rating)
        
        # Determine trend
        if len(rating_history) < 3:
            trend = 'stable'
        else:
            # Look at the trend over the last 5 matches or fewer if not available
            recent = rating_history[-min(5, len(rating_history)):]
            
            if recent[-1] > recent[0] + 20:  # Significant improvement
                trend = 'improving'
            elif recent[-1] < recent[0] - 20:  # Significant decline
                trend = 'declining'
            else:
                trend = 'stable'
        
        return rating, trend
    
    def save_combined_data(self, output_dir="public/data/combined"):
        """Save combined player history data"""
        os.makedirs(output_dir, exist_ok=True)
        
        player_history = self.generate_player_history()
        if not player_history:
            print("No player history data to save.")
            return
        
        # Save full player history
        with open(f"{output_dir}/player_history.json", 'w') as f:
            json.dump(player_history, f, indent=2)
        
        # Create summary data with essential stats only
        player_summary = {}
        
        for player_name, history in player_history.items():
            player_summary[player_name] = {
                'name': player_name,
                'current_team': history['current_team'],
                'current_handicap': history['current_handicap'],
                'handicap_trend': history['handicap_trend'],
                'handicap_changed_recently': history['handicap_changed_recently'],
                'recent_win_percentage': history['recent_win_percentage'],
                'elo_rating': history['elo_rating'],
                'rating_trend': history['rating_trend'],
                'seasons_played': history['seasons_played'],
                'team_history': history['team_history']
            }
        
        # Save summary data
        with open(f"{output_dir}/player_summary.json", 'w') as f:
            json.dump(player_summary, f, indent=2)
        
        print(f"Combined data saved to:")
        print(f"  - {output_dir}/player_history.json")
        print(f"  - {output_dir}/player_summary.json")

# Example usage
if __name__ == "__main__":
    combiner = SeasonDataCombiner()
    combiner.list_available_seasons()
    combiner.save_combined_data()
