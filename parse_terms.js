const fs = require('fs');
const html = fs.readFileSync('/Users/vishnuvardhanreddy/.gemini/antigravity-ide/brain/65ee5268-e905-467d-96fa-54fb13ec0aaa/.system_generated/steps/6098/content.md', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);

// Find the main content area (usually article, main, or entry-content)
const content = $('.entry-content').text() || $('main').text() || $('article').text() || $('body').text();
const cleanedText = content.replace(/\s+/g, ' ').trim();

// write to a new markdown file
fs.writeFileSync('/Users/vishnuvardhanreddy/.gemini/antigravity-ide/brain/65ee5268-e905-467d-96fa-54fb13ec0aaa/scratch/terms.txt', cleanedText);
console.log('Extracted text length:', cleanedText.length);
