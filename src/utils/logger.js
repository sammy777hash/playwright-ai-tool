const fs = require('fs');

async function capture(page, step, previousScreenshot = null) {
  // Dynamically import pixelmatch and pngjs
  const { default: pixelmatch } = await import('pixelmatch');
  const { PNG } = await import('pngjs');

  const timestamp = Date.now();
  const screenshotPath = `tests\\step-${timestamp}.png`;
  await page.screenshot({ path: screenshotPath });

  let diffResult = null;
  if (previousScreenshot) {
    const img1 = PNG.sync.read(fs.readFileSync(previousScreenshot));
    const img2 = PNG.sync.read(fs.readFileSync(screenshotPath));
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    if (numDiffPixels > 0) {
      const diffPath = `tests\\diff-${timestamp}.png`;
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
      diffResult = { numDiffPixels, diffPath };
    }
  }

  const logEntry = { step, timestamp, screenshot: screenshotPath, diff: diffResult };
  fs.appendFileSync('tests\\log.json', JSON.stringify(logEntry) + '\n');
  return logEntry;
}

async function startVideo(page) {
  console.log('Video recording TBD - use Playwright recordVideo in future');
}

module.exports = { capture, startVideo };