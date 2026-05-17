const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetches webpage title and description from a given URL.
 * @param {string} url - The URL to fetch metadata from.
 * @returns {Promise<{title: string, description: string}>}
 */
const fetchMetadata = async (url) => {
  try {
    const { data } = await axios.get(url, {
      timeout: 3000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    
    const title = $('title').text() || 
                 $('meta[property="og:title"]').attr('content') || 
                 $('meta[name="twitter:title"]').attr('content') || 
                 '';

    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || 
                       '';

    return {
      title: title.trim(),
      description: description.trim()
    };
  } catch (err) {
    console.error(`Failed to fetch metadata for ${url}:`, err.message);
    return { title: '', description: '' };
  }
};

module.exports = { fetchMetadata };
