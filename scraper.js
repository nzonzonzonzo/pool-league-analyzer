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
    console.log('Fetching page with cookie (first 15 chars): ' + authCookie.substring(0, 15) + '...');
    
    // Fetch the page content with the authentication cookie
    const response = await axios.get('https://leagues2.amsterdambilliards.com/8ball/abc/individual_standings.php?foo=bar', {
      headers: {
        'Cookie': authCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
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
    
    // Validation to ensure we don't save empty data
    if (allPlayerData.length === 0) {
      console.error("Error: No player data was found!");
      
      // If in development, provide more detailed debugging
      if (process.env.NODE_ENV === 'development') {
        console.log("HTML structure debug info:");
        console.log(`- Page title: "${$('title').text()}"`);
        console.log(`- Tables found: ${$('table').length}`);
        console.log(`- Is login page? ${$('form[name="login"]').length > 0 ? 'Yes' : 'No'}`);
        
        // Log a sample of what we're dealing with for debugging
        fs.writeFileSync('debug/html_sample.txt', response.data.substring(0, 5000));
        console.log("Saved first 5000 characters of HTML to debug/html_sample.txt");
        
        // Extract page messages, which might indicate login errors or other issues
        const messages = [];
        $('center').each(function() {
          const text = $(this).text().trim();
          if (text.length > 0) {
            messages.push(text);
          }
        });
        fs.writeFileSync('debug/page_messages.txt', messages.join('\n'));
        
        // Try a desperate direct search for team names in the raw HTML
        console.log("\nAttempting emergency fallback pattern matching...");
        const teamMatches = response.data.match(/[^>]<b><i>([^<]+)<\/i><\/b>/g);
        if (teamMatches && teamMatches.length > 0) {
          console.log(`Found ${teamMatches.length} potential team names in raw HTML`);
          fs.writeFileSync('debug/team_matches.txt', JSON.stringify(teamMatches, null, 2));
        } else {
          console.log("No team names found in raw HTML");
        }
        
        // Try looking for player data patterns in the HTML
        const playerNameMatches = response.data.match(/<td class="[^"]+"[^>]*><b>[^<]+<\/b><\/td>/g);
        if (playerNameMatches && playerNameMatches.length > 0) {
          console.log(`Found ${playerNameMatches.length} potential player name cells in raw HTML`);
          fs.writeFileSync('debug/player_matches.txt', JSON.stringify(playerNameMatches.slice(0, 20), null, 2));
        } else {
          console.log("No player name patterns found in raw HTML");
        }
      }
      
      // Create a placeholder with a message instead of empty data
      // This will show up in the JSON file and help with debugging
      allPlayerData.push({
        error: true,
        message: "No player data found. Authentication may have failed or the HTML structure may have changed.",
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`Successfully found ${allPlayerData.length} players from ${teamCount} teams`);
    }
    
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
