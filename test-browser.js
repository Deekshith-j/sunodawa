const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Page loaded successfully');
  } catch (err) {
    console.log('Navigation error:', err.message);
  }
  
  await browser.close();
})();
