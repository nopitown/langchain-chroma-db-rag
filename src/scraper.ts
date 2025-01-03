import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

async function scrapeWebsite(url: string): Promise<string[]> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Remove unnecessary elements
  $('script').remove();
  $('style').remove();
  $('nav').remove();
  $('footer').remove();
  
  // Extract text content
  const textContent = $('body')
    .text()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return textContent;
}

async function main() {
  try {
    const url = 'https://nopitown.com/';
    const content = await scrapeWebsite(url);
    
    // Create data directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    
    // Save the scraped content
    await fs.writeFile(
      path.join(process.cwd(), 'data', 'scraped_content.json'),
      JSON.stringify(content, null, 2)
    );
    
    console.log('Content scraped and saved successfully!');
  } catch (error) {
    console.error('Error scraping website:', error);
  }
}

main(); 