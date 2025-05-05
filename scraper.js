const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * Scrapes the Amsterdam Billiards individual standings page and updates a JSON file
 * with the latest player statistics.
 * 
 * @param {string} jsonFilePath - Path to save the updated JSON file
 * @param {string} authCookie - Authentication cookie for accessing the protected page
 * @returns {Promise<object>} - The updated stats data
 */
async function scrapeAndUpdateStats(jsonFilePath = 'public/data/team_stats.json', authCookie) {
  if (!authCookie) {
    throw new Error('Authentication cookie is required');
  }

  try {
    console.log('Starting scraper...');
    // Fetch the page content with the authentication cookie
    const response = await axios.get('https://leagues2.amsterdambilliards.com/8ball/abc/individual_standings.php?foo=bar', {
      headers: {
        'Cookie': authCookie
      }
    });
    
    console.log('Page fetched successfully, parsing data...');
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Save the raw HTML for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      fs.writeFileSync('debug/html.txt', response.data);
      console.log('Saved raw HTML to debug/html.txt for inspection');
      
      // Also save some sample team tables to debug folders
      const sampleTeam = $('table.tableteir2').eq(5).html();
      fs.writeFileSync('debug/sample_team.html', sampleTeam || 'No team found');
      
      // Check if login form exists (indicating authentication failed)
      const loginForm = $('form[name="login"]').length;
      if (loginForm > 0) {
        console.error('ERROR: Login form detected - authentication failed or cookie expired');
        fs.writeFileSync('debug/login_detected.txt', 'Authentication failed - cookie might be expired');
      }
    }
    
    // Log the length of the HTML to verify we got a proper response
    console.log(`Fetched HTML content (${response.data.length} bytes)`);
    
    // Check if we can find the expected elements
    const dataLevelRows = $('td.data_level_1_nobg').length;
    const teamTables = $('table.tableteir2').length;
    console.log(`Found ${dataLevelRows} team name rows and ${teamTables} team tables`);
    
    // Initialize an array to hold all player data
    const allPlayerData = [];
    
    // Find all team names - they appear in table rows with the class 'data_level_1_nobg'
    $('table.tableteir2 tr td.data_level_1_nobg').each(function() {
      // Get the team name which is wrapped in <b><i> tags
      const teamNameElement = $(this).find('b i');
      if (teamNameElement.length === 0) return;
      
      const teamName = teamNameElement.text().trim();
      console.log('Processing team: ' + teamName);
      
      // The team table is the next table after this row's parent table
      const teamTable = $(this).closest('table').next('table');
      
      // Find player rows within the team table - exclude header (first 2) and totals (last) rows
      const playerRows = teamTable.find('tr').not(':first-child').not(':nth-child(2)').not(':last-child');
      
      // Log number of player rows found
      console.log(`  Found ${playerRows.length} player rows for team ${teamName}`);
      
      playerRows.each(function() {
        // Skip totals row which has class "level_4"
        if ($(this).find('td.level_4').length > 0) return;
        
        const cells = $(this).find('td');
        if (cells.length < 5) return; // Skip any malformed rows
        
        // Extract the data from the cells - adjusting for the actual structure
        const name = $(cells[1]).text().replace(/\s+/g, ' ').trim().replace(/^b/, '');
        if (!name || name === 'Totals') return; // Skip rows without names or the totals row
        
        // The website actually uses the <b> tags for player names, so handle that
        const nameText = name.replace(/^B/i, ''); // Remove any leading 'B' from the text extraction
        
        const handicap = parseInt($(cells[2]).text().trim(), 10) || 0;
        const wins = parseInt($(cells[5]).text().trim(), 10) || 0;
        const losses = parseInt($(cells[6]).text().trim(), 10) || 0;
        const total = parseInt($(cells[7]).text().trim(), 10) || 0;
        
        // Calculate win percentage
        const winPercentage = total > 0 ? ((wins / total) * 100).toFixed(1) + '%' : '0.0%';
        
        // Add player data to the array
        allPlayerData.push({
          team: teamName,
          name,
          handicap,
          wins,
          losses,
          total,
          winPercentage
        });
      });
    });
    
    // Sort players alphabetically by team and then by name
    allPlayerData.sort((a, b) => {
      if (a.team !== b.team) {
        return a.team.localeCompare(b.team);
      }
      return a.name.localeCompare(b.name);
    });
    
    // Save the data to a JSON file if a path is provided
    if (jsonFilePath) {
      // Ensure directory exists
      const dir = jsonFilePath.split('/').slice(0, -1).join('/');
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(jsonFilePath, JSON.stringify(allPlayerData, null, 2));
      console.log(`Data successfully written to ${jsonFilePath} with ${allPlayerData.length} player records`);
    }
    
    return allPlayerData;
  } catch (error) {
    console.error('Error scraping data:', error);
    throw error;
  }
}

// For Node.js usage
module.exports = { scrapeAndUpdateStats };
