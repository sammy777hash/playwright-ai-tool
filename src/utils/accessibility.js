const path = require('path');

async function scanAccessibility(page) {
  // Inject axe-core script into the page
  await page.addScriptTag({
    path: path.resolve('node_modules/axe-core/axe.min.js')
  });

  // Run accessibility scan
  const results = await page.evaluate(async () => {
    return await window.axe.run();
  });

  return results.violations.map(v => ({
    id: v.id,
    description: v.description,
    impact: v.impact,
    nodes: v.nodes.map(n => n.html)
  }));
}

module.exports = { scanAccessibility };