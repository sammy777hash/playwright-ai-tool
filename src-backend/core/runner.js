const { chromium } = require('playwright');
const { healLocator } = require('../ai/healer');
const { capture } = require('../utils/logger');

async function runTest(script, onStep = () => {}) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let steps = [];

  try {
    await page.goto('https://example.com');
    const originalLocator = '#login-btn';
    const healedLocator = await healLocator(page, originalLocator);
    const fixedScript = script.replace(originalLocator, healedLocator);
    await eval(fixedScript)(page, async (step) => {
      const logEntry = await capture(page, step);
      steps.push(logEntry);
      onStep(step);
    });
    if (healedLocator !== originalLocator) {
      steps.push(await capture(page, `Healed locator from ${originalLocator} to ${healedLocator}`));
    }
  } catch (error) {
    steps.push(await capture(page, `Error: ${error.message}`));
  } finally {
    await browser.close();
    return steps;
  }
}

module.exports = { runTest };