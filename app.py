from flask import Flask, render_template, request, jsonify, send_file
import os
import json
import matplotlib
matplotlib.use('Agg')  # Use Agg backend for generating plots without GUI
import matplotlib.pyplot as plt
import io
import base64
from urllib.parse import quote

# Import our Pool League analyzer classes
from pool_stats_analyzer import PoolLeagueScraper, PoolMatchupAnalyzer

app = Flask(__name__)

# Configuration
DATA_FILE = 'data/pool_stats.json'
TEAMS_FILE = 'data/teams.txt'

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Save teams data from the paste.txt
def save_teams_data(content):
    with open(TEAMS_FILE, 'w') as f:
        f.write(content)
    return os.path.exists(TEAMS_FILE)

@app.route('/')
def index():
    """Render the main page."""
    # Check if we have data
    has_data = os.path.exists(DATA_FILE)
    has_teams_file = os.path.exists(TEAMS_FILE)
    
    # Load team names if we have data
    teams = []
    if has_data:
        analyzer = PoolMatchupAnalyzer(DATA_FILE)
        teams = analyzer.get_teams_list()
    
    return render_template('index.html', 
                          has_data=has_data,
                          has_teams_file=has_teams_file,
                          teams=teams)

@app.route('/upload_teams', methods=['POST'])
def upload_teams():
    """Handle team data uploads."""
    teams_content = request.form.get('teams_content')
    
    if not teams_content:
        return jsonify({
            'success': False,
            'message': 'No team data provided.'
        })
    
    try:
        if save_teams_data(teams_content):
            return jsonify({
                'success': True,
                'message': 'Team data saved successfully!'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to save team data.'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

@app.route('/scrape', methods=['POST'])
def scrape_data():
    """Scrape new data from the league website."""
    cookie = request.form.get('cookie') or "qJy9wAvA%2B3sZ08JkrfHGxA%3D%3D"
    
    if not os.path.exists(TEAMS_FILE):
        return jsonify({
            'success': False,
            'message': 'Teams file not found. Please upload team data first.'
        })
    
    try:
        # Initialize scraper
        scraper = PoolLeagueScraper(cookie=cookie)
        
        # Load teams data
        if not scraper.load_teams_from_file(TEAMS_FILE):
            return jsonify({
                'success': False,
                'message': 'Failed to load teams data. Check the format.'
            })
        
        # Scrape teams
        if not scraper.scrape_teams():
            return jsonify({
                'success': False,
                'message': 'Failed to scrape team data. Check your authentication cookie.'
            })
        
        # Consolidate player data
        scraper.consolidate_player_data()
        
        # Save data
        scraper.save_data(DATA_FILE)
        
        # Get list of teams
        analyzer = PoolMatchupAnalyzer(DATA_FILE)
        teams = analyzer.get_teams_list()
        
        return jsonify({
            'success': True,
            'message': 'Data scraped successfully!',
            'teams': teams
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

@app.route('/get_players', methods=['GET'])
def get_players():
    """Get players for a specific team."""
    team_name = request.args.get('team')
    
    if not team_name:
        return jsonify({
            'success': False,
            'message': 'Team name is required.'
        })
    
    try:
        analyzer = PoolMatchupAnalyzer(DATA_FILE)
        players = analyzer.get_team_players(team_name)
        
        return jsonify({
            'success': True,
            'players': players
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

@app.route('/analyze', methods=['POST'])
def analyze_matchup():
    """Analyze matchups between two teams."""
    our_team = request.form.get('our_team')
    opponent_team = request.form.get('opponent_team')
    
    if not our_team or not opponent_team:
        return jsonify({
            'success': False,
            'message': 'Both teams are required.'
        })
    
    try:
        analyzer = PoolMatchupAnalyzer(DATA_FILE)
        
        # Verify teams exist
        our_team_id = analyzer.find_team(our_team)
        opponent_team_id = analyzer.find_team(opponent_team)
        
        if not our_team_id or not opponent_team_id:
            missing = []
            if not our_team_id:
                missing.append(our_team)
            if not opponent_team_id:
                missing.append(opponent_team)
                
            return jsonify({
                'success': False,
                'message': f"Could not find team(s): {', '.join(missing)}. Try a different team name."
            })
        
        # Get matchup analysis
        matchup_data = analyzer.analyze_matchup(our_team, opponent_team)
        
        # Get optimal lineup
        optimal_lineup = analyzer.get_optimal_lineup(our_team, opponent_team)
        
        if not matchup_data:
            return jsonify({
                'success': False,
                'message': 'Could not analyze matchups. Insufficient data.'
            })
        
        # Format the data for display
        formatted_matchups = {}
        
        for our_player, opponents in matchup_data.items():
            if not opponents:  # Skip players with no matchup data
                continue
                
            formatted_matchups[our_player] = []
            
            sorted_opponents = sorted(
                opponents.items(),
                key=lambda x: x[1]['win_probability'],
                reverse=True
            )
            
            for opp_name, opp_data in sorted_opponents:
                formatted_matchups[our_player].append({
                    'name': opp_name,
                    'handicap': opp_data['opponent_handicap'],
                    'win_probability': round(opp_data['win_probability'] * 100, 1),
                    'handicap_diff': opp_data['handicap_diff']
                })
        
        # Format optimal lineup if available
        formatted_lineup = []
        overall_probability = 0
        
        if optimal_lineup and optimal_lineup['lineup']:
            for match in optimal_lineup['lineup']:
                formatted_lineup.append({
                    'our_player': match['our_player'],
                    'opponent': match['opponent'],
                    'win_probability': round(match['win_probability'] * 100, 1),
                    'our_handicap': match['our_handicap'],
                    'opponent_handicap': match['opponent_handicap'],
                    'handicap_diff': match['handicap_diff']
                })
            
            overall_probability = round(optimal_lineup['expected_win_probability'] * 100, 1)
        
        return jsonify({
            'success': True,
            'matchups': formatted_matchups,
            'optimal_lineup': formatted_lineup,
            'overall_probability': overall_probability
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        })

@app.route('/player_stats/<player_name>')
def player_stats(player_name):
    """Display detailed stats for a specific player."""
    if not player_name:
        return "Player name is required.", 400
    
    try:
        analyzer = PoolMatchupAnalyzer(DATA_FILE)
        performance_data = analyzer.plot_player_performance(player_name)
        
        if not performance_data:
            return "Player data not found or insufficient.", 404
        
        # Create plot
        plt.figure(figsize=(10, 6))
        
        # Bar chart for win rates against different handicaps
        handicaps = performance_data['handicaps']
        win_rates = performance_data['win_rates']
        
        plt.bar(handicaps, [rate * 100 for rate in win_rates], color='skyblue')
        plt.axhline(y=50, color='r', linestyle='-', alpha=0.3)  # 50% win rate line
        
        plt.title(f"{player_name}'s Performance by Handicap Differential")
        plt.xlabel("Opponent Handicap - Player Handicap")
        plt.ylabel("Win Rate (%)")
        plt.xticks(handicaps)
        plt.ylim(0, 100)
        
        # Add win percentage labels
        for i, v in enumerate(win_rates):
            plt.text(handicaps[i], v * 100 + 3, f"{v*100:.1f}%", ha='center')
        
        # Add overall win rate
        overall_win_rate = performance_data['total_games_won'] / performance_data['total_games'] * 100 if performance_data['total_games'] > 0 else 0
        plt.figtext(0.5, 0.01, f"Overall Win Rate: {overall_win_rate:.1f}% ({performance_data['total_games_won']} of {performance_data['total_games']} games)", 
                   ha="center", fontsize=12, bbox={"facecolor":"orange", "alpha":0.2, "pad":5})
        
        # Save plot to a bytes buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=80)
        plt.close()
        
        # Encode the image to base64 string
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        
        encoded = base64.b64encode(image_png).decode('utf-8')
        plot_url = f"data:image/png;base64,{encoded}"
        
        return render_template(
            'player_stats.html',
            player=player_name,
            handicap=performance_data['handicap'],
            plot_url=plot_url,
            total_games=performance_data['total_games'],
            win_rate=overall_win_rate
        )
        
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)