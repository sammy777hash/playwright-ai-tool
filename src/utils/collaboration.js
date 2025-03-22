const fs = require('fs');

function saveComment(testId, comment) {
  const commentsFile = 'tests\\comments.json';
  let comments = {};
  if (fs.existsSync(commentsFile)) {
    comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  }
  if (!comments[testId]) comments[testId] = [];
  comments[testId].push({ comment, timestamp: Date.now() });
  fs.writeFileSync(commentsFile, JSON.stringify(comments, null, 2));
  return comments[testId];
}

function getComments(testId) {
  const commentsFile = 'tests\\comments.json';
  if (!fs.existsSync(commentsFile)) return [];
  const comments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  return comments[testId] || [];
}

module.exports = { saveComment, getComments };