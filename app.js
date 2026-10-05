let db;
let adminUnsubscribe = null;
let leaderboardUnsubscribe = null;

if(firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    
    // Auto-start the live front-facing leaderboard
    initRealtimeLeaderboard();
}

// --- QUESTION MANAGEMENT ---
const defaultQuestions = [
  { question: "In what year was CJID officially founded?", options: ["2014", "2015", "2018", "2020"], answer: 0 },
  { question: "Which of these is NOT a core program area of CJID?", options: ["Media Development", "Agricultural Policy", "Accountability", "Elections"], answer: 1 }
];

// Helper to safely load questions without crashing on corrupted localStorage
function loadQuestionsFromStorage() {
  try {
    const stored = localStorage.getItem('trivia_questions');
    if (!stored) return [...defaultQuestions];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error("Error reading questions from localStorage:", e);
  }
  return [...defaultQuestions];
}

let questions = loadQuestionsFromStorage();
let currentQuestionIndex = 0;
let score = 0;
let currentUser = null;
let editingIndex = -1;

function saveQuestions() {
  try {
    localStorage.setItem('trivia_questions', JSON.stringify(questions));
  } catch (e) {
    console.error("Error saving questions to localStorage:", e);
  }
  renderAdminList();
}

function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  if(target) target.classList.add('active');
}

// --- ADMIN PANEL FUNCTIONS ---
window.openAdmin = function() {
  const pwd = prompt("Enter Admin Password:");
  if (pwd === "322abj12254") {
    switchScreen('screen-admin');
    renderAdminList();
    if(db) fetchAdminResults();
  } else if (pwd !== null) {
    alert("Incorrect password. Access denied.");
  }
}

function renderAdminList() {
  const list = document.getElementById('admin-question-list');
  if (!list) return;
  list.innerHTML = '';
  
  if (!questions || questions.length === 0) {
    list.innerHTML = '<div style="padding: 12px; text-align: center; color: #64748b;">No questions available. Add a question above!</div>';
    return;
  }

  questions.forEach((q, index) => {
    const item = document.createElement('div');
    item.className = 'q-list-item';
    item.innerHTML = `
      <div class="reorder-container">
        <button class="move-btn" onclick="moveQuestionUp(${index})" ${index === 0 ? 'disabled' : ''}>▲</button>
        <button class="move-btn" onclick="moveQuestionDown(${index})" ${index === questions.length - 1 ? 'disabled' : ''}>▼</button>
      </div>
      <span style="flex-grow: 1; margin-right: 15px;"><strong>Q${index + 1}:</strong> ${q.question}</span>
      <div class="action-buttons">
        <button class="edit-btn" onclick="editQuestion(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteQuestion(${index})">Delete</button>
      </div>
    `;
    list.appendChild(item);
  });
}

window.moveQuestionUp = function(index) {
  if (index > 0 && index < questions.length) {
    const temp = questions[index];
    questions[index] = questions[index - 1];
    questions[index - 1] = temp;
    
    // Maintain correct editing reference
    if (editingIndex === index) {
      editingIndex = index - 1;
    } else if (editingIndex === index - 1) {
      editingIndex = index;
    }
    
    saveQuestions();
  }
}

window.moveQuestionDown = function(index) {
  if (index >= 0 && index < questions.length - 1) {
    const temp = questions[index];
    questions[index] = questions[index + 1];
    questions[index + 1] = temp;
    
    // Maintain correct editing reference
    if (editingIndex === index) {
      editingIndex = index + 1;
    } else if (editingIndex === index + 1) {
      editingIndex = index;
    }
    
    saveQuestions();
  }
}

window.editQuestion = function(index) {
  if (index < 0 || index >= questions.length) return;
  editingIndex = index;
  const q = questions[index];
  
  document.getElementById('new-q').value = q.question || '';
  document.getElementById('opt-0').value = q.options && q.options[0] ? q.options[0] : '';
  document.getElementById('opt-1').value = q.options && q.options[1] ? q.options[1] : '';
  document.getElementById('opt-2').value = q.options && q.options[2] ? q.options[2] : '';
  document.getElementById('opt-3').value = q.options && q.options[3] ? q.options[3] : '';
  document.getElementById('correct-opt').value = parseInt(q.answer, 10) || 0;
  
  document.getElementById('form-title').textContent = `Edit Question ${index + 1}`;
  document.getElementById('save-btn').textContent = "Update Question";
  document.getElementById('cancel-btn').style.display = "inline-flex";
}

window.cancelEdit = function() {
  editingIndex = -1;
  document.getElementById('form-title').textContent = "Add New Question";
  document.getElementById('save-btn').textContent = "Save Question";
  document.getElementById('cancel-btn').style.display = "none";
  
  document.getElementById('new-q').value = '';
  document.getElementById('opt-0').value = '';
  document.getElementById('opt-1').value = '';
  document.getElementById('opt-2').value = '';
  document.getElementById('opt-3').value = '';
  document.getElementById('correct-opt').value = 0;
}

window.saveQuestionForm = function() {
  const qText = document.getElementById('new-q').value.trim();
  const opts = [
    document.getElementById('opt-0').value.trim(),
    document.getElementById('opt-1').value.trim(),
    document.getElementById('opt-2').value.trim(),
    document.getElementById('opt-3').value.trim()
  ];
  const ans = parseInt(document.getElementById('correct-opt').value, 10);

  if (!qText || opts.some(opt => opt === '')) {
    return alert('Please fill in all fields (Question and 4 options)');
  }

  if (editingIndex === -1) {
    questions.push({ question: qText, options: opts, answer: ans });
  } else {
    questions[editingIndex] = { question: qText, options: opts, answer: ans };
  }
  
  saveQuestions();
  cancelEdit();
}

window.deleteQuestion = function(index) {
  if (confirm("Are you sure you want to delete this question?")) {
    questions.splice(index, 1);
    
    if (editingIndex === index) {
      cancelEdit();
    } else if (editingIndex > index) {
      editingIndex--;
    }
    
    saveQuestions();
  }
}

window.resetDefaults = function() {
  if(confirm("Delete all custom questions and restore defaults?")) {
    questions = [...defaultQuestions];
    saveQuestions();
    cancelEdit();
  }
}


// --- REALTIME LIVE RESULTS & RANKING LOGIC ---

function sortResultsByScoreAndTime(results) {
  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const tA = (a.timestamp && typeof a.timestamp.toMillis === 'function') ? a.timestamp.toMillis() : (a.localTime || Date.now());
    const tB = (b.timestamp && typeof b.timestamp.toMillis === 'function') ? b.timestamp.toMillis() : (b.localTime || Date.now());
    return tA - tB; 
  });
}

function fetchAdminResults() {
  const tbody = document.getElementById('admin-results-body');
  const countSpan = document.getElementById('participant-count');
  if(!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading live results...</td></tr>';
  
  if (adminUnsubscribe) adminUnsubscribe();
  
  adminUnsubscribe = db.collection('scores').onSnapshot((snapshot) => {
    let results = [];
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

    sortResultsByScoreAndTime(results);

    if(countSpan) countSpan.textContent = results.length;

    tbody.innerHTML = '';
    if(results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No submissions yet.</td></tr>';
        return;
    }

    results.forEach((data, index) => {
      const rank = index + 1;
      let dateObj = new Date();
      if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        dateObj = data.timestamp.toDate();
      } else if (data.localTime) {
        dateObj = new Date(data.localTime);
      }

      const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateString = dateObj.toLocaleDateString();

      tbody.innerHTML += `<tr>
        <td><strong>#${rank}</strong></td>
        <td>${data.name}<br><small style="color:var(--text-muted);">${data.email}</small></td>
        <td>${data.score}</td>
        <td>${timeString}<br><small style="color:var(--text-muted);">${dateString}</small></td>
      </tr>`;
    });
  }, (err) => {
    console.error("Live Fetch Error:", err);
    tbody.innerHTML = `<tr><td colspan="4" style="color: red;">Error: ${err.message}</td></tr>`;
  });
}

function initRealtimeLeaderboard() {
  if (leaderboardUnsubscribe) leaderboardUnsubscribe();
  
  leaderboardUnsubscribe = db.collection('scores').onSnapshot((snapshot) => {
    let results = [];
    snapshot.forEach(doc => results.push(doc.data()));

    sortResultsByScoreAndTime(results);

    const body = document.getElementById('leaderboard-body');
    if(body) {
      body.innerHTML = '';
      if(results.length === 0) {
          body.innerHTML = '<tr><td colspan="3" style="text-align:center;">Waiting for players...</td></tr>';
          return;
      }
      
      results.forEach((data, index) => {
        const rank = index + 1;
        body.innerHTML += `<tr><td>#${rank} ${rank <= 3 ? '🏆' : ''}</td><td>${data.name}</td><td>${data.score}</td></tr>`;
      });
    }
  }, (err) => {
     console.error("Live Leaderboard Error:", err);
  });
}

window.wipeResults = async function() {
  if(!db) return alert("Firebase not connected.");
  if (!confirm("🚨 WARNING: Are you sure you want to delete ALL participant results? This CANNOT be undone.")) return;
  
  const pwd = prompt("Enter Admin Password to confirm wipe:");
  if (pwd !== "322abj12254") return alert("Wipe cancelled: Incorrect password.");

  try {
    const snapshot = await db.collection('scores').get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    alert("All results have been wiped successfully.");
  } catch (err) {
    console.error("Error wiping results:", err);
    alert("Error wiping results. " + err.message);
  }
}

// --- GAMEPLAY FUNCTIONS ---
window.signIn = function(event) {
  event.preventDefault(); 
  if(!db) return alert("Please configure Firebase keys in app.js first.");
  
  const name = document.getElementById('player-name').value;
  const email = document.getElementById('player-email').value;
  currentUser = { displayName: name, email: email };
  startNewGame();
}

function startNewGame() {
  questions = loadQuestionsFromStorage(); // Always pull latest saved questions on game start
  if (!questions || questions.length === 0) return alert("No questions available! Add some in the Admin panel.");
  currentQuestionIndex = 0;
  score = 0;
  switchScreen('screen-game');
  loadQuestion();
}

function loadQuestion() {
  if (!questions || currentQuestionIndex >= questions.length) {
    finishGame();
    return;
  }

  const q = questions[currentQuestionIndex];
  document.getElementById('question-tracker').textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
  document.getElementById('score-tracker').textContent = `Score: ${score}`;
  document.getElementById('question-text').textContent = q.question;

  const container = document.getElementById('options-container');
  container.innerHTML = '';

  if (q.options && Array.isArray(q.options)) {
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.onclick = () => selectOption(idx);
      container.appendChild(btn);
    });
  }
}

function selectOption(selectedIdx) {
  const currentQuestion = questions[currentQuestionIndex];
  const selected = parseInt(selectedIdx, 10);
  const correct = parseInt(currentQuestion.answer, 10);

  if (selected === correct) {
    score += 100;
  }
  
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    finishGame();
  }
}

async function finishGame() {
  switchScreen('screen-results');
  document.getElementById('final-score-text').textContent = `${currentUser.displayName}, your score is ${score}!`;

  try {
    await db.collection('scores').add({
      name: currentUser.displayName,
      email: currentUser.email,
      score: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      localTime: Date.now()
    });
  } catch (err) { console.error("Score save error", err); }
}
