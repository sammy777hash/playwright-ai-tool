const translations = {
    en: { run: 'Run', speak: 'Speak', comment: 'Add Comment' },
    es: { run: 'Ejecutar', speak: 'Hablar', comment: 'Agregar Comentario' }
  };
  
  let lang = 'en';
  let testId = null;
  
  document.getElementById('language').addEventListener('change', (e) => {
    lang = e.target.value;
    updateTranslations();
  });
  
  function updateTranslations() {
    const t = translations[lang] || translations.en;
    document.getElementById('speak-label').textContent = t.speak;
    document.querySelector('button[onclick="runTest()"]').textContent = t.run;
    document.querySelector('button[onclick="addComment()"]').textContent = t.comment;
  }
  
  async function runTest() {
    const prompt = document.getElementById('prompt').value;
    const logsDiv = document.getElementById('logs');
    const analyticsDiv = document.getElementById('analytics');
    const screenshotsDiv = document.getElementById('screenshots');
    logsDiv.textContent = 'Running...';
    analyticsDiv.innerHTML = '';
    screenshotsDiv.innerHTML = '';
    document.getElementById('comments-list').innerHTML = '';
  
    try {
      const response = await fetch('http://localhost:4000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      testId = data.testId;
      logsDiv.textContent = JSON.stringify(data.steps, null, 2);
  
      data.steps.forEach(step => {
        if (step.analytics) {
          const analyticsP = document.createElement('p');
          analyticsP.innerHTML = `<h3>Predictive Analytics</h3>
            Error Rate: ${step.analytics.errorRate.toFixed(2)}%<br>
            Flaky Steps: ${step.analytics.flakySteps.join(', ') || 'None'}`;
          analyticsDiv.appendChild(analyticsP);
        }
        if (step.screenshot) {
          const img = document.createElement('img');
          img.src = `http://localhost:4000/${step.screenshot}`;
          img.alt = step.step;
          screenshotsDiv.appendChild(document.createElement('h3')).textContent = step.step;
          screenshotsDiv.appendChild(img);
          if (step.diff) {
            const diffP = document.createElement('p');
            diffP.textContent = `Visual difference detected: ${step.diff.numDiffPixels} pixels`;
            const diffImg = document.createElement('img');
            diffImg.src = `http://localhost:4000/${step.diff.diffPath}`;
            diffImg.alt = 'Diff';
            screenshotsDiv.appendChild(diffP);
            screenshotsDiv.appendChild(diffImg);
          }
        }
        if (step.issues) {
          const issuesDiv = document.createElement('div');
          issuesDiv.innerHTML = '<h3>Accessibility Issues</h3>';
          step.issues.forEach(issue => {
            const p = document.createElement('p');
            p.textContent = `${issue.id}: ${issue.description} (Impact: ${issue.impact})`;
            issuesDiv.appendChild(p);
          });
          screenshotsDiv.appendChild(issuesDiv);
        }
      });
  
      // Fetch comments for this test run
      if (testId) fetchComments(testId);
    } catch (error) {
      logsDiv.textContent = `Error: ${error.message}`;
    }
  }
  
  async function fetchComments(testId) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';
    try {
      const response = await fetch(`http://localhost:4000/api/comments/${testId}`);
      const comments = await response.json();
      comments.forEach(c => {
        const li = document.createElement('li');
        li.textContent = `${c.comment} (at ${new Date(c.timestamp).toLocaleString()})`;
        commentsList.appendChild(li);
      });
    } catch (error) {
      console.log('Error fetching comments:', error);
    }
  }
  
  async function addComment() {
    if (!testId) return;
    const comment = document.getElementById('new-comment').value;
    if (!comment) return;
  
    try {
      await fetch('http://localhost:4000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, comment })
      });
      document.getElementById('new-comment').value = '';
      fetchComments(testId);
    } catch (error) {
      console.log('Error adding comment:', error);
    }
  }
  
  function speak() {
    const recognition = new window.SpeechRecognition();
    recognition.lang = lang;
    recognition.onresult = (e) => {
      document.getElementById('prompt').value = e.results[0][0].transcript;
    };
    recognition.onerror = (e) => console.log('Speech error:', e.error);
    recognition.start();
  }
  
  updateTranslations();