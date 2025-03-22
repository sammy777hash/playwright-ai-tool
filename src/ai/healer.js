async function healLocator(page, locator) {
    try {
      await page.locator(locator).click();
      return locator;
    } catch (e) {
      console.log(`Healing locator: ${locator}`);
      let newLocator = locator;
      if (locator.startsWith('#')) {
        newLocator = `[data-test="${locator.slice(1)}"]`;
      } else if (locator.startsWith('.')) {
        newLocator = `text=${locator.slice(1)}`;
      }
      try {
        await page.locator(newLocator).click();
        return newLocator;
      } catch {
        return locator;
      }
    }
  }
  
  module.exports = { healLocator };