const express = require('express');
const { runTest } = require('./core/runner');
const { generateTest } = require('./ai/generator');
const { saveComment, getComments } = require('./utils/collaboration');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});
app.use(express.static('tests'));

app.post('/api/test', async (req, res) => {
  const { prompt } = req.body;
  const script = await generateTest(prompt);
  const testId = Date.now().toString(); // Unique ID for this test run
  const steps = await runTest(script, () => {});
  res.json({ testId, steps });
});

app.post('/api/comments', async (req, res) => {
  const { testId, comment } = req.body;
  const comments = saveComment(testId, comment);
  res.json(comments);
});

app.get('/api/comments/:testId', (req, res) => {
  const comments = getComments(req.params.testId);
  res.json(comments);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));