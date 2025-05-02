# Amsterdam Billiards Pool League Stats Analyzer

This application helps you analyze Amsterdam Billiards pool league player statistics and calculate the odds of winning matchups against other teams, taking into account player handicaps and historical performance.

## Features

- **Authenticated Web Scraping**: Automatically scrapes game data from Amsterdam Billiards league website
- **Game-Level Analysis**: Focuses on individual game wins/losses rather than just match outcomes
- **Handicap Intelligence**: Analyzes how players perform against opponents with different handicap ratings
- **Optimal Lineup Calculator**: Suggests the best player matchups to maximize your team's chances of winning
- **Performance Visualization**: Shows how players perform against different handicap levels
- **User-Friendly Web Interface**: Easy-to-use interface for analyzing matchups and viewing stats

## Installation

1. Clone this repository or download the files
2. Create a virtual environment (recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

## Usage

### Command Line Interface

You can use the command line interface for basic operations:

1. **Create a teams.txt file** with team names and URLs:
   ```
   Team Name	https://leagues2.amsterdambilliards.com/8ball/abc/team_scouting_report.php?season_id=234&team_id=XXX
   ```
   (One team per line, with a tab character between the team name and URL)

2. **Scrape new data**:
   ```
   python pool_stats_analyzer.py --scrape --teams-file teams.txt
   ```

3. **Analyze matchups**:
   ```
   python pool_stats_analyzer.py --analyze --our-team "Your Team Name" --opponent "Opponent Team Name"
   ```

### Web Interface (Recommended)

1. Start the web server:
   ```
   python app.py
   ```

2. Open your browser and navigate to `http://localhost:5000`

3. If this is your first time using the app:
   - Paste the team data (from paste.txt) into the text area
   - Click "Save Team Data" to store the team information
   - The app will then prompt you to scrape the data
   - Click "Scrape Data" to collect the statistics (this may take a few minutes)

4. Once data is collected:
   - Select your team and the opponent team
   - Click "Analyze Matchups" to see the results
   - The optimal lineup will be displayed at the top
   - All possible matchups are shown below with win probabilities
   - Click on a player's name to see their detailed statistics

## Authentication

The application uses a cookie-based authentication to access the Amsterdam Billiards league website. The default cookie value should work, but if you encounter authentication issues, you may need to update it:

1. Log in to the Amsterdam Billiards league website in your browser
2. Use your browser's developer tools to find the "T8UID" cookie value
3. Enter this value in the web interface or use the `--cookie` parameter in the command line

## Understanding the Results

- **Win Probability**: The estimated chance of winning based on historical performance
- **Handicap Differential**: The difference between opponent handicap and player handicap
   - Positive value: Opponent has a higher handicap (usually harder)
   - Negative value: Opponent has a lower handicap (usually easier)
- **Performance by Handicap**: Charts showing how players perform against different handicap levels

## File Structure

- `pool_stats_analyzer.py`: Core functionality and command-line interface
- `app.py`: Flask web application
- `templates/`: HTML templates for the web interface
- `teams.txt`: List of teams and their URLs
- `pool_stats.json`: Stored league data (created after scraping)

## Requirements

- Python 3.7 or higher
- See `requirements.txt` for package dependencies

## Privacy and Security

- Authentication is handled via a session cookie
- All data is stored locally on your machine in the `pool_stats.json` file
- No login credentials are stored by the application

## Troubleshooting

- If the scraper fails, check that your cookie value is correct
- If the wrong team name is displayed, make sure the team names in teams.txt are accurate
- For detailed errors, check the console output during execution
