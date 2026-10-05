// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let auth, db;
if(firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
}

// --- QUESTION MANAGEMENT ---
const defaultQuestions = [
  { question: "In what year was our company officially founded?", options: ["2015", "2018", "2020", "2022"], answer: 1 },
  { question: "Which core value emphasizes client success?", options: ["Innovation", "Customer First", "Transparency", "Agility"], answer: 1 }
];

let questions = JSON.parse(localStorage.getItem('trivia_questions')) || defaultQuestions;
let currentQuestionIndex = 0;
let score = 0;
let currentUser = null;

function saveQuestions() {
  localStorage.setItem('trivia_questions', JSON.stringify(questions));
  renderAdminList();
}

function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// --- ADMIN PANEL FUNCTIONS ---
window.openAdmin = function() {
  switchScreen('screen-admin');
  renderAdminList();
}

function renderAdminList() {
  const list = document.getElementById('admin-question-list');
  list.innerHTML = '<h3>Current Questions</h3>';
  questions.forEach((q, index) => {
    const item = document.createElement('div');
    item.className = 'q-list-item';
    item.innerHTML = `
      <span><strong>Q${index + 1}:</strong> ${q.question}</span>
      <button class="delete-btn" onclick="deleteQuestion(${index})">Delete</button>
    `;
    list.appendChild(item);
  });
}

window.addQuestion = function() {
  const qText = document.getElementById('new-q').value;
  const opts = [
    document.getElementById('opt-0').value,
    document.getElementById('opt-1').value,
    document.getElementById('opt-2').value,
    document.getElementById('opt-3').value
  ];
  const ans = parseInt(document.getElementById('correct-opt').value);

  if (!qText || opts.includes('')) return alert('Please fill all fields');

  questions.push({ question: qText, options: opts, answer: ans });
  saveQuestions();
  
  document.getElementById('new-q').value = '';
  opts.forEach((_, i) => document.getElementById(`opt-${i}`).value = '');
}

window.deleteQuestion = function(index) {
  questions.splice(index, 1);
  saveQuestions();
}

window.resetDefaults = function() {
  if(confirm("Delete all custom questions and restore defaults?")) {
    questions = [...defaultQuestions];
    saveQuestions();
  }
}

// --- GAMEPLAY FUNCTIONS ---
window.signInWithGoogle = function() {
  if(!auth) return alert("Please configure Firebase keys in app.js first.");
  
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then((result) => {
    currentUser = result.user;
    startNewGame();
  }).catch(err => alert("Login failed: " + err.message));
}

function startNewGame() {
  if(questions.length === 0) return alert("No questions available! Add some in the Admin panel.");
  currentQuestionIndex = 0;
  score = 0;
  switchScreen('screen-game');
  loadQuestion();
}

function loadQuestion() {
  const q = questions[currentQuestionIndex];
  document.getElementById('question-tracker').textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
  document.getElementById('score-tracker').textContent = `Score: ${score}`;
  document.getElementById('question-text').textContent = q.question;

  const container = document.getElementById('options-container');
  container.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectOption(idx);
    container.appendChild(btn);
  });
}

function selectOption(selectedIdx) {
  if (selectedIdx === questions[currentQuestionIndex].answer) score += 100;
  
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) loadQuestion();
  else finishGame();
}

async function finishGame() {
  switchScreen('screen-results');
  document.getElementById('final-score-text').textContent = `${currentUser.displayName}, your score is ${score}!`;

  try {
    await db.collection('scores').add({
      name: currentUser.displayName,
      score: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) { console.error("Score save error", err); }

  fetchLeaderboard();
}

async function fetchLeaderboard() {
  const body = document.getElementById('leaderboard-body');
  body.innerHTML = '';
  try {
    const snapshot = await db.collection('scores').orderBy('score', 'desc').limit(5).get();
    let rank = 1;
    snapshot.forEach(doc => {
      const data = doc.data();
      body.innerHTML += `<tr><td>#${rank} ${rank<=3?'🏆':''}</td><td>${data.name}</td><td>${data.score}</td></tr>`;
      rank++;
    });
  } catch (err) { console.error(err); }
}