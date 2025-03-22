const { chromium } = require('playwright');
const { healLocator } = require('../ai/healer');
const { capture, startVideo } = require('../utils/logger');
const { scanAccessibility } = require('../utils/accessibility');
const { analyzeLogs } = require('../utils/analytics');
const { scanSecurity } = require('../utils/security');

async function runTest(script, onStep = () => {}) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  let steps = [];
  let previousScreenshot = null;

  try {
    // Run analytics
    const analytics = analyzeLogs();
    steps.push({ step: 'Predictive Analytics', analytics });

    await startVideo(page);
    await page.goto('https://example.com');

    // Run security scan
    const securityIssues = await scanSecurity(page);
    if (securityIssues.length > 0) {
      steps.push({ step: 'Security issues found', securityIssues });
    }

    // Run accessibility scan
    const a11yIssues = await scanAccessibility(page);
    if (a11yIssues.length > 0) {
      steps.push({ step: 'Accessibility issues found', issues: a11yIssues });
    }

    // Run the test
    const originalLocator = '#login-btn';
    const healedLocator = await healLocator(page, originalLocator);
    const fixedScript = script.replace(originalLocator, healedLocator);
    await eval(fixedScript)(page, async (step) => {
      const logEntry = await capture(page, step, previousScreenshot);
      previousScreenshot = logEntry.screenshot;
      steps.push(logEntry);
      onStep(step);
    });
    if (healedLocator !== originalLocator) {
      const logEntry = await capture(page, `Healed locator from ${originalLocator} to ${healedLocator}`, previousScreenshot);
      previousScreenshot = logEntry.screenshot;
      steps.push(logEntry);
    }
  } catch (error) {
    const logEntry = await capture(page, `Error: ${error.message}`, previousScreenshot);
    steps.push(logEntry);
  } finally {
    await context.close();
    await browser.close();
    return steps;
  }
}

module.exports = { runTest };