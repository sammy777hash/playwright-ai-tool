const { runTest } = require('./core/runner');
const { generateTest } = require('./ai/generator');

async function main() {
  const prompt = "test login with invalid credentials";
  const script = await generateTest(prompt);
  const steps = await runTest(script, console.log);
  console.log('Steps:', steps);
}

main();