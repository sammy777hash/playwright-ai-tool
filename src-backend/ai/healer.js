async function healLocator(page, locator) {
    try {
      await page.locator(locator).click(); // Test the original locator
      return locator; // If it works, keep it
    } catch (e) {
      console.log(`Healing locator: ${locator}`);
      // Simple fallback: try a different locator type
      let newLocator = locator;
      if (locator.startsWith('#')) {
        newLocator = `[data-test="${locator.slice(1)}"]`; // Switch to data-test attribute
      } else if (locator.startsWith('.')) {
        newLocator = `text=${locator.slice(1)}`; // Switch to text-based locator
      }
      try {
        await page.locator(newLocator).click();
        return newLocator;
      } catch {
        return locator; // If healing fails, return original (let it fail naturally)
      }
    }
  }
  
  module.exports = { healLocator };