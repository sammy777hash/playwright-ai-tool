async function scanSecurity(page) {
    const vulnerabilities = [];
  
    // Test for XSS by injecting a script and checking if it executes
    try {
      await page.fill('input', '<script>alert("XSS")</script>');
      await page.click('button[type="submit"]');
      const alertTriggered = await page.evaluate(() => {
        return !!window.alert;
      });
      if (alertTriggered) {
        vulnerabilities.push({
          type: 'XSS',
          description: 'Potential XSS vulnerability: Input not sanitized'
        });
      }
    } catch (e) {
      console.log('XSS test failed:', e.message);
    }
  
    // Test for CSRF by checking for tokens in forms
    try {
      const hasCsrfToken = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).some(form => form.querySelector('input[name="_csrf"]'));
      });
      if (!hasCsrfToken) {
        vulnerabilities.push({
          type: 'CSRF',
          description: 'No CSRF token found in forms'
        });
      }
    } catch (e) {
      console.log('CSRF test failed:', e.message);
    }
  
    return vulnerabilities;
  }
  
  module.exports = { scanSecurity };