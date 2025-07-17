const { chromium } = require('playwright');
const path = require('path');

async function takeScreenshot() {
  const browser = await chromium.launch({
    headless: true
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  try {
    await page.goto('http://localhost:7777', { waitUntil: 'networkidle' });
    
    const screenshotPath = path.join(__dirname, '..', 'screenshots', 'dashboard-en-usd-verification.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot();