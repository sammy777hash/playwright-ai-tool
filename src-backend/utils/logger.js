const fs = require('fs');

async function capture(page, step) {
  const timestamp = Date.now();
  const screenshotPath = `tests\\step-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath });
  const logEntry = { step, timestamp, screenshot: screenshotPath };
  fs.appendFileSync('tests\\log.json', JSON.stringify(logEntry) + '\n');
  return logEntry;
}

async function startVideo(page) {
  console.log('Video recording TBD - use Playwright recordVideo in future');
  // Placeholder for later
}

module.exports = { capture, startVideo };