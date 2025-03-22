async function generateTest(prompt) {
    const templates = {
      "test login with invalid credentials": `
        async (page, log) => {
          log('Navigating to login');
          await page.goto('https://example.com/login');
          log('Filling form');
          await page.fill('#username', 'wronguser');
          await page.fill('#password', 'wrongpass');
          log('Clicking login');
          await page.click('#login-btn');
          log('Checking error');
          await expect(page.locator('.error')).toHaveText('Invalid credentials');
        }
      `
    };
    return templates[prompt] || `async (page, log) => { log('No test for: ${prompt}'); }`;
  }
  
  module.exports = { generateTest };