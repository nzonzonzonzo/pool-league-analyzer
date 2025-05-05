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
    console.log('Fetching page with cookie (first 15 chars): ' + authCookie.substring(0, 15) + '...');
    
    const response = await axios.get('https://leagues2.amsterdambilliards.com/8ball/abc/individual_standings.php?foo=bar', {
      headers: {
        'Cookie': authCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Page fetched successfully, parsing data...');
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Save the raw HTML for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      // Create debug directory if it doesn't exist
      if (!fs.existsSync('debug')) {
        fs.mkdirSync('debug', { recursive: true });
      }
      
      fs.writeFileSync('debug/html.txt', response.data);
      console.log('Saved raw HTML to debug/html.txt for inspection');
      
      // Log title to see what page we're on
      const pageTitle = $('title').text();
      console.log(`Page title: "${pageTitle}"`);
      
      // Check if login form exists (indicating authentication failed)
      const loginForm = $('form[name="login"]').length;
      if (loginForm > 0) {
        console.error('ERROR: Login form detected - authentication failed or cookie expired');
        fs.writeFileSync('debug/login_detected.txt', 'Authentication failed - cookie might be expired');
      }
      
      // Save HTML structure for debugging
      let htmlStructure = '';
      $('table').each((i, el) => {
        htmlStructure += `Table #${i}: class="${$(el).attr('class')}" width="${$(el).attr('width')}"\n`;
      });
      fs.writeFileSync('debug/html_structure.txt', htmlStructure);
    }
    
    // Log the length of the HTML to verify we got a proper response
    console.log(`Fetched HTML content (${response.data.length} bytes)`);
    
    // Check if we can find the expected elements
    const teamNameElements = $('td.data_level_1_nobg b i').length;
    const teamTables = $('table.tableteir2').length;
    console.log(`Found ${teamNameElements} team name elements and ${teamTables} team tables`);
    
    // Initialize an array to hold all player data
    const allPlayerData = [];
    const allPlayerData = [];
    
    // Try a completely different selector approach based on the HTML structure
    let teamCount = 0;
    let playerCount = 0;
    
    // Find divisions first (they have a specific bgcolor)
    $('tr[bgcolor="#FF6500"], tr[bgcolor="#000080"], tr[bgcolor="#551A8B"], tr[bgcolor="#CD2626"], tr[bgcolor="#006400"], tr[bgcolor="#CC9900"]').each(function() {
      const divisionName = $(this).find('h3').text().trim();
      console.log(`Found division: ${divisionName}`);
      
      // Get the tables after this division header
      let currentElement = $(this).next();
      
      while(currentElement.length && !currentElement.is('tr[bgcolor]')) {
        // Check if this contains a team name
        if (currentElement.find('td.data_level_1_nobg').length > 0) {
          const teamNameRow = currentElement;
          const teamName = teamNameRow.find('b i').text().trim();
          if (teamName) {
            teamCount++;
            console.log(`  Found team ${teamCount}: ${teamName}`);
            
            // The player table should be the next element
            const playerTable = teamNameRow.next('table');
            
            if (playerTable.length) {
              // Find player rows - skip headers and total
              const playerRows = playerTable.find('tr:not(:first-child):not(:nth-child(2)):not(:last-child)');
              
              playerRows.each(function() {
                const cells = $(this).find('td');
                if (cells.length < 5) return; // Skip rows without enough cells
                
                // Check if it's a totals row
                if ($(cells[0]).text().trim().includes('Totals')) return;
                
                playerCount++;
                
                // Extract player data
                const name = $(cells[1]).text().trim();
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
                
                if (playerCount % 10 === 0) {
                  console.log(`    Processed ${playerCount} players so far...`);
                }
              });
            } else {
              console.log(`    Error: Could not find player table for team ${teamName}`);
            }
          }
        }
        
        currentElement = currentElement.next();
      }
    });
    
    console.log(`Total players found: ${playerCount}`);
    
    // Skip our previous approach entirely as it wasn't working
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
