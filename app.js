const firebaseConfig = {
  apiKey: "AIzaSyAOqC13bplLUJ_8uv09DO6PneaZOoGF-mc",
  authDomain: "trivia-e6cd8.firebaseapp.com",
  projectId: "trivia-e6cd8",
  storageBucket: "trivia-e6cd8.firebasestorage.app",
  messagingSenderId: "96735171511",
  appId: "1:96735171511:web:1f4675fd31f584bda24e32"
};

let db;
let adminUnsubscribe = null;
let leaderboardUnsubscribe = null;
let cachedResultsList = []; // Caches current participants for detail inspection

// Safe Firebase Initialization
try {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    initRealtimeLeaderboard();
  }
} catch (e) {
  console.warn("Firebase initialization skipped or keys not configured yet:", e);
}

// --- OFFICIAL PERMANENT QUESTION BANK (20 QUESTIONS) ---
const defaultQuestions = [
  {
    "id": 1,
    "question": "How many investigative stories were published in September 2026 to amplify discourse on online harms and digital rights?",
    "options": [
      "10",
      "12",
      "17",
      "20"
    ],
    "answer": 2
  },
  {
    "id": 2,
    "question": "Which organisation is CJID collaborating with to provide legal advice and support to victims affected by AI scam advertisements on TikTok?",
    "options": [
      "SERAP",
      "UNESCO",
      "Johns Hopkins",
      "DAIDAC"
    ],
    "answer": 0
  },
  {
    "id": 3,
    "question": "What is one of the key planned activities for the October 2026 progress overview?",
    "options": [
      "Convening a 3-day workshop in Bayelsa State",
      "Finalising the Johns Hopkins research",
      "Publishing 17 investigative stories",
      "Launching the Platform Fellowship"
    ],
    "answer": 1
  },
  {
    "id": 4,
    "question": "Which tool or initiative is designated to monitor, document, and analyse digital rights developments across Africa?",
    "options": [
      "Platform Accountability Investigations",
      "Digital Rights Tracker",
      "Platform Fellowship",
      "Media Talking Points"
    ],
    "answer": 1
  },
  {
    "id": 5,
    "question": "In September 2026, CJID convened a 3-day skill-building and community empowerment workshop for youth in which state?",
    "options": [
      "Benue State",
      "Niger State",
      "Bayelsa State",
      "Kano State"
    ],
    "answer": 2
  },
  {
    "id": 6,
    "question": "Under the Agric Project, how many total stories were commissioned, supported, and published to conclude the Climate\u2013Agriculture reporting Project?",
    "options": [
      "4",
      "10",
      "12",
      "15"
    ],
    "answer": 2
  },
  {
    "id": 7,
    "question": "Under the Natural Resource and Extractive Programme, an in-depth investigation was planned regarding the deaths of 37 miners in which state?",
    "options": [
      "Niger State",
      "Bayelsa State",
      "Benue State",
      "Kaduna State"
    ],
    "answer": 0
  },
  {
    "id": 8,
    "question": "Which partner organisations collaborated on finalising the methodology for the 2027 election risk assessment under the Conflict, Security & Human Rights Project?",
    "options": [
      "SERAP and WHO",
      "DAIDAC and MINE",
      "Gates Foundation and NESG",
      "PPLAAF and HBBA"
    ],
    "answer": 1
  },
  {
    "id": 9,
    "question": "On September 18th, CJID signed a Memorandum of Understanding (MOU) with which body to safeguard the welfare and safety of journalists?",
    "options": [
      "National Human Rights Commission (NHRC)",
      "Ghana Legal Aid Commission",
      "Reporters Without Borders (RSF)",
      "Platform to Protect Whistleblowers in Africa (PPLAAF)"
    ],
    "answer": 0
  },
  {
    "id": 10,
    "question": "How many total entries were received across all 6 categories for the Alfred Opubor Next Gen Awards?",
    "options": [
      "14",
      "40",
      "110",
      "175"
    ],
    "answer": 2
  },
  {
    "id": 11,
    "question": "Under the Next Gen Project, where is the FCDO-partnered Campus Journalism Clinic planned to be hosted in November?",
    "options": [
      "Faculty of Communications and Media Studies, UNIBEN",
      "University of Gambia",
      "Kaduna State University",
      "University of Abuja"
    ],
    "answer": 0
  },
  {
    "id": 12,
    "question": "In September, how many of the 14 published stories on the Campus Reporter website originated from The Gambia?",
    "options": [
      "2",
      "3",
      "5",
      "6"
    ],
    "answer": 1
  },
  {
    "id": 13,
    "question": "DUBAWA attended the 3rd election integrity summit organised by AfEONET and which other organisation?",
    "options": [
      "SERAP",
      "CDD",
      "WHO",
      "NED"
    ],
    "answer": 1
  },
  {
    "id": 14,
    "question": "What was the direct impact of DUBAWA\u2019s TikTok In-Depth reporting?",
    "options": [
      "Five TikTok accounts were removed",
      "A new law was passed in Ghana",
      "Ten radio stations were sanctioned",
      "A grant of $175,000 was awarded"
    ],
    "answer": 0
  },
  {
    "id": 15,
    "question": "Which upcoming activity is planned for Media and Information Literacy (MIL) Training-of-Trainers sessions?",
    "options": [
      "Sessions in Zamfara and Katsina",
      "Sessions in Bayelsa and Benue",
      "Workshops in FCT and Kebbi",
      "Conferences in London and Accra"
    ],
    "answer": 0
  },
  {
    "id": 16,
    "question": "Which Ghanaian government minister reacted to DUBAWA\u2019s OSINT investigation regarding a fetish priest named Kweku Bonsam?",
    "options": [
      "Lands and Natural Resources Minister",
      "Sports Minister",
      "Minister of Information",
      "Attorney General"
    ],
    "answer": 1
  },
  {
    "id": 17,
    "question": "UDEME submitted an application for which specific grant during September 2026?",
    "options": [
      "$175,000 World Bank\u2019s Civic Partnership Grant",
      "Gates Foundation Media Grant",
      "NED Extractive Sector Grant",
      "UNESCO IPDC Capacity Building Grant"
    ],
    "answer": 0
  },
  {
    "id": 18,
    "question": "An FOI request was submitted to the Ministry of Solid Minerals and Development regarding an agreement signed at the UN General Assembly valued at how much?",
    "options": [
      "$33.7 billion",
      "$700 billion",
      "$175,000",
      "$3 million"
    ],
    "answer": 1
  },
  {
    "id": 19,
    "question": "UDEME's analysis of the latest Auditor-General's report highlighted unidentified beneficiaries amounting to N33.7 billion under which government programme?",
    "options": [
      "Gifted Schools programme",
      "FG cash transfer",
      "Subnational security architecture",
      "NSCDC oversight fund"
    ],
    "answer": 1
  },
  {
    "id": 20,
    "question": "What is one of the upcoming field reporting focus areas for UDEME planned for October?",
    "options": [
      "The $700 billion mineral agreement execution",
      "Subnational security architecture and the Gifted Schools programme",
      "The UNILAG misappropriation trial",
      "The 2023 Presidential election petition tribunal"
    ],
    "answer": 1
  }
];

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
let userAnswers = []; // Tracks player selected option indices during gameplay

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

// --- EXPORT QUESTIONS JSON FUNCTION ---
window.exportQuestionsJSON = function() {
  const jsonString = JSON.stringify(questions, null, 2);
  navigator.clipboard.writeText(jsonString).then(() => {
    alert("Questions JSON copied to clipboard! You can paste it anywhere to save or backup.");
  }).catch(err => {
    prompt("Copy your questions JSON below:", jsonString);
  });
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
        <button class="move-btn" type="button" onclick="moveQuestionUp(${index})" ${index === 0 ? 'disabled' : ''}>▲</button>
        <button class="move-btn" type="button" onclick="moveQuestionDown(${index})" ${index === questions.length - 1 ? 'disabled' : ''}>▼</button>
      </div>
      <span style="flex-grow: 1; margin-right: 15px;"><strong>Q${index + 1}:</strong> ${q.question}</span>
      <div class="action-buttons">
        <button class="edit-btn" type="button" onclick="editQuestion(${index})">Edit</button>
        <button class="delete-btn" type="button" onclick="deleteQuestion(${index})">Delete</button>
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
    
    if (editingIndex === index) editingIndex = index - 1;
    else if (editingIndex === index - 1) editingIndex = index;
    
    saveQuestions();
  }
}

window.moveQuestionDown = function(index) {
  if (index >= 0 && index < questions.length - 1) {
    const temp = questions[index];
    questions[index] = questions[index + 1];
    questions[index + 1] = temp;
    
    if (editingIndex === index) editingIndex = index + 1;
    else if (editingIndex === index + 1) editingIndex = index;
    
    saveQuestions();
  }
}

window.editQuestion = function(index) {
  if (index < 0 || index >= questions.length) return;
  editingIndex = index;
  const q = questions[index];
  
  const qElem = document.getElementById('new-q');
  const opt0 = document.getElementById('opt-0');
  const opt1 = document.getElementById('opt-1');
  const opt2 = document.getElementById('opt-2');
  const opt3 = document.getElementById('opt-3');
  const corrOpt = document.getElementById('correct-opt');

  if (qElem) qElem.value = q.question || '';
  if (opt0) opt0.value = q.options && q.options[0] ? q.options[0] : '';
  if (opt1) opt1.value = q.options && q.options[1] ? q.options[1] : '';
  if (opt2) opt2.value = q.options && q.options[2] ? q.options[2] : '';
  if (opt3) opt3.value = q.options && q.options[3] ? q.options[3] : '';
  if (corrOpt) corrOpt.value = parseInt(q.answer, 10) || 0;
  
  const titleElem = document.getElementById('form-title');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  if (titleElem) titleElem.textContent = `Edit Question ${index + 1}`;
  if (saveBtn) saveBtn.textContent = "Update Question";
  if (cancelBtn) cancelBtn.style.display = "inline-flex";
}

window.cancelEdit = function() {
  editingIndex = -1;
  const titleElem = document.getElementById('form-title');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  if (titleElem) titleElem.textContent = "Add New Question";
  if (saveBtn) saveBtn.textContent = "Save Question";
  if (cancelBtn) cancelBtn.style.display = "none";
  
  ['new-q', 'opt-0', 'opt-1', 'opt-2', 'opt-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const corrOpt = document.getElementById('correct-opt');
  if (corrOpt) corrOpt.value = 0;
}

window.saveQuestionForm = function() {
  const qTextElem = document.getElementById('new-q');
  const opt0 = document.getElementById('opt-0');
  const opt1 = document.getElementById('opt-1');
  const opt2 = document.getElementById('opt-2');
  const opt3 = document.getElementById('opt-3');
  const corrOpt = document.getElementById('correct-opt');

  if (!qTextElem || !opt0 || !opt1 || !opt2 || !opt3 || !corrOpt) return;

  const qText = qTextElem.value.trim();
  const opts = [
    opt0.value.trim(),
    opt1.value.trim(),
    opt2.value.trim(),
    opt3.value.trim()
  ];
  const ans = parseInt(corrOpt.value, 10);

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
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading live results...</td></tr>';
  
  if (adminUnsubscribe) adminUnsubscribe();
  
  try {
    adminUnsubscribe = db.collection('scores').onSnapshot((snapshot) => {
      let results = [];
      snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));

      sortResultsByScoreAndTime(results);
      cachedResultsList = results;

      if(countSpan) countSpan.textContent = results.length;

      tbody.innerHTML = '';
      if(results.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No submissions yet.</td></tr>';
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
          <td>
            <button class="view-btn" type="button" onclick="viewParticipantAnswers(${index})">View Answers</button>
          </td>
        </tr>`;
      });
    }, (err) => {
      console.error("Live Fetch Error:", err);
      tbody.innerHTML = `<tr><td colspan="5" style="color: red;">Error: ${err.message}</td></tr>`;
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color: red;">Error connecting to database. Please check Firebase keys in app.js.</td></tr>`;
  }
}

// --- INSPECT PARTICIPANT ANSWERS FUNCTION ---
window.viewParticipantAnswers = function(index) {
  if (!cachedResultsList || !cachedResultsList[index]) return;
  const participant = cachedResultsList[index];
  
  document.getElementById('detail-player-title').textContent = `${participant.name}'s Answer Sheet`;
  document.getElementById('detail-player-subtitle').textContent = `Email: ${participant.email} | Final Score: ${participant.score} pts`;
  
  const container = document.getElementById('detail-questions-container');
  container.innerHTML = '';
  
  const pAnswers = participant.answers || [];
  const pQuestionsSnapshot = participant.questionsSnapshot || questions;
  
  if (pQuestionsSnapshot.length === 0) {
    container.innerHTML = '<p style="text-align:center; color: #64748b;">No question breakdown recorded for this submission.</p>';
  } else {
    pQuestionsSnapshot.forEach((q, qIdx) => {
      const card = document.createElement('div');
      card.className = 'answer-card';
      
      const userSelectedIdx = pAnswers[qIdx] !== undefined ? parseInt(pAnswers[qIdx], 10) : -1;
      const correctIdx = parseInt(q.answer, 10);
      const isCorrect = userSelectedIdx === correctIdx;
      
      const userSelectedText = userSelectedIdx >= 0 && q.options && q.options[userSelectedIdx] ? q.options[userSelectedIdx] : "No Answer Selected";
      const correctText = q.options && q.options[correctIdx] ? q.options[correctIdx] : "Unknown Option";
      
      card.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 6px;">Q${qIdx + 1}: ${q.question}</div>
        <div style="font-size: 13px; color: #475569; margin-bottom: 4px;">
          Participant Answer: <strong>${userSelectedText}</strong>
        </div>
        ${!isCorrect ? `<div style="font-size: 13px; color: #166534; margin-bottom: 4px;">Correct Answer: <strong>${correctText}</strong></div>` : ''}
        <span class="answer-pill ${isCorrect ? 'pill-correct' : 'pill-incorrect'}">
          ${isCorrect ? '✓ Correct (+100 pts)' : '✗ Incorrect (0 pts)'}
        </span>
      `;
      container.appendChild(card);
    });
  }
  
  switchScreen('screen-answer-details');
}

function initRealtimeLeaderboard() {
  if (!db) return;
  if (leaderboardUnsubscribe) leaderboardUnsubscribe();
  
  try {
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
  } catch (e) {
    console.warn("Realtime leaderboard disabled until Firebase configured.");
  }
}

window.wipeResults = async function() {
  if(!db) return alert("Firebase not connected. Please paste valid Firebase keys into app.js.");
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
  if(event) event.preventDefault(); 
  
  const nameElem = document.getElementById('player-name');
  const emailElem = document.getElementById('player-email');

  if (!nameElem || !emailElem) return;
  
  const name = nameElem.value.trim();
  const email = emailElem.value.trim();

  if(!name || !email) return alert("Please fill in your name and email.");

  currentUser = { displayName: name, email: email };
  startNewGame();
}

function startNewGame() {
  questions = loadQuestionsFromStorage();
  if (!questions || questions.length === 0) return alert("No questions available! Add some in the Admin panel.");
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  switchScreen('screen-game');
  loadQuestion();
}

function loadQuestion() {
  if (!questions || currentQuestionIndex >= questions.length) {
    finishGame();
    return;
  }

  const q = questions[currentQuestionIndex];
  const qTrack = document.getElementById('question-tracker');
  const sTrack = document.getElementById('score-tracker');
  const qText = document.getElementById('question-text');

  if (qTrack) qTrack.textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
  if (sTrack) sTrack.textContent = `Score: ${score}`;
  if (qText) qText.textContent = q.question;

  const container = document.getElementById('options-container');
  if (!container) return;
  container.innerHTML = '';

  if (q.options && Array.isArray(q.options)) {
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.type = 'button';
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

  userAnswers.push(selected);

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
  const scoreTextElem = document.getElementById('final-score-text');
  if (scoreTextElem && currentUser) {
    scoreTextElem.textContent = `${currentUser.displayName}, your score is ${score}!`;
  }

  if (db) {
    try {
      await db.collection('scores').add({
        name: currentUser.displayName,
        email: currentUser.email,
        score: score,
        answers: userAnswers,
        questionsSnapshot: questions,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        localTime: Date.now()
      });
    } catch (err) { 
      console.error("Score save error", err); 
    }
  }
}
