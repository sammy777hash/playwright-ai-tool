const fs = require('fs');

function analyzeLogs() {
  if (!fs.existsSync('tests\\log.json')) return { flakySteps: [], errorRate: 0 };

  const logs = fs.readFileSync('tests\\log.json', 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));

  // Count errors per step
  const stepErrors = {};
  let totalSteps = 0;
  let errorCount = 0;

  logs.forEach(log => {
    totalSteps++;
    if (log.step.includes('Error')) {
      errorCount++;
      const stepName = log.step.split('Error:')[0].trim();
      stepErrors[stepName] = (stepErrors[stepName] || 0) + 1;
    }
  });

  // Identify flaky steps (failed > 20% of the time)
  const flakySteps = Object.entries(stepErrors)
    .filter(([_, count]) => count / totalSteps > 0.2)
    .map(([step]) => step);

  const errorRate = (errorCount / totalSteps) * 100;
  return { flakySteps, errorRate };
}

module.exports = { analyzeLogs };