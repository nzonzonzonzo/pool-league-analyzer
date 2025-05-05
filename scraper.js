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
    
    // Initialize an array to hold all player data
    const allPlayerData = [];
    
    // Find all team tables - each contained within a table that follows a 'data_level_1_nobg' class element
    $('tr.data_level_1_nobg, tr[bgcolor="#FF6500"] + table, tr[bgcolor="#000080"] + table, tr[bgcolor="#551A8B"] + table, tr[bgcolor="#CD2626"] + table, tr[bgcolor="#006400"] + table, tr[bgcolor="#CC9900"] + table').each(function() {
      // Get the team name from the previous row
      const teamNameElement = $(this).find('td b i');
      if (teamNameElement.length === 0) return;
      
      const teamName = teamNameElement.text().trim();
      console.log('Processing team: ' + teamName);
      
      // Find player rows within the team table
      const playerRows = $(this).next('table').find('tr:not(:first-child):not(:last-child)');
      
      playerRows.each(function() {
        const cells = $(this).find('td');
        if (cells.length < 10) return; // Skip header rows or malformed rows
        
        // Extract the data from the cells
        const name = $(cells[1]).text().replace(/\s+/g, ' ').trim().replace(/^b/, '');
        if (!name || name === 'Totals') return; // Skip rows without names or the totals row
        
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
