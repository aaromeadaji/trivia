// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAOqC13bplLUJ_8uv09DO6PneaZOoGF-mc",
  authDomain: "trivia-e6cd8.firebaseapp.com",
  projectId: "trivia-e6cd8",
  storageBucket: "trivia-e6cd8.firebasestorage.app",
  messagingSenderId: "96735171511",
  appId: "1:96735171511:web:1f4675fd31f584bda24e32"
};


let db;
if(firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
}

// --- QUESTION MANAGEMENT ---
const defaultQuestions = [
  { question: "In what year was CJID officially founded?", options: ["2014", "2015", "2018", "2020"], answer: 0 },
  { question: "Which of these is NOT a core program area of CJID?", options: ["Media Development", "Agricultural Policy", "Accountability", "Elections"], answer: 1 }
];

let questions = JSON.parse(localStorage.getItem('trivia_questions')) || defaultQuestions;
let currentQuestionIndex = 0;
let score = 0;
let currentUser = null;
let editingIndex = -1; // Tracks if the admin is editing a question

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
  const pwd = prompt("Enter Admin Password:");
  if (pwd === "322abj12254") {
    switchScreen('screen-admin');
    renderAdminList();
  } else if (pwd !== null) {
    alert("Incorrect password. Access denied.");
  }
}

function renderAdminList() {
  const list = document.getElementById('admin-question-list');
  list.innerHTML = '<h3>Current Questions</h3>';
  questions.forEach((q, index) => {
    const item = document.createElement('div');
    item.className = 'q-list-item';
    item.innerHTML = `
      <span style="flex-grow: 1; margin-right: 15px;"><strong>Q${index + 1}:</strong> ${q.question}</span>
      <div class="action-buttons">
        <button class="edit-btn" onclick="editQuestion(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteQuestion(${index})">Delete</button>
      </div>
    `;
    list.appendChild(item);
  });
}

window.editQuestion = function(index) {
  editingIndex = index;
  const q = questions[index];
  
  // Populate the form with the selected question's details
  document.getElementById('new-q').value = q.question;
  document.getElementById('opt-0').value = q.options[0];
  document.getElementById('opt-1').value = q.options[1];
  document.getElementById('opt-2').value = q.options[2];
  document.getElementById('opt-3').value = q.options[3];
  document.getElementById('correct-opt').value = q.answer;
  
  // Update UI to reflect editing mode
  document.getElementById('form-title').textContent = `Edit Question ${index + 1}`;
  document.getElementById('save-btn').textContent = "Update Question";
  document.getElementById('cancel-btn').style.display = "inline-flex";
  
  // Scroll to the form
  document.querySelector('.admin-form').scrollIntoView({behavior: 'smooth'});
}

window.cancelEdit = function() {
  editingIndex = -1;
  document.getElementById('form-title').textContent = "Add New Question";
  document.getElementById('save-btn').textContent = "Save Question";
  document.getElementById('cancel-btn').style.display = "none";
  
  // Clear the form
  document.getElementById('new-q').value = '';
  document.getElementById('opt-0').value = '';
  document.getElementById('opt-1').value = '';
  document.getElementById('opt-2').value = '';
  document.getElementById('opt-3').value = '';
  document.getElementById('correct-opt').value = 0;
}

window.saveQuestionForm = function() {
  const qText = document.getElementById('new-q').value;
  const opts = [
    document.getElementById('opt-0').value,
    document.getElementById('opt-1').value,
    document.getElementById('opt-2').value,
    document.getElementById('opt-3').value
  ];
  const ans = parseInt(document.getElementById('correct-opt').value);

  if (!qText || opts.includes('')) return alert('Please fill all fields');

  if (editingIndex === -1) {
    // Adding a new question
    questions.push({ question: qText, options: opts, answer: ans });
  } else {
    // Updating an existing question
    questions[editingIndex] = { question: qText, options: opts, answer: ans };
  }
  
  saveQuestions();
  cancelEdit(); // Reset the form back to 'Add' mode
}

window.deleteQuestion = function(index) {
  if (confirm("Are you sure you want to delete this question?")) {
    questions.splice(index, 1);
    saveQuestions();
    
    // If they delete the question they were currently editing, reset the form
    if (editingIndex === index) cancelEdit();
  }
}

window.resetDefaults = function() {
  if(confirm("Delete all custom questions and restore defaults?")) {
    questions = [...defaultQuestions];
    saveQuestions();
    cancelEdit();
  }
}

// --- GAMEPLAY FUNCTIONS ---
window.signIn = function(event) {
  event.preventDefault(); // Prevent page reload
  
  if(!db) return alert("Please configure Firebase keys in app.js first.");
  
  const name = document.getElementById('player-name').value;
  const email = document.getElementById('player-email').value;

  currentUser = { displayName: name, email: email };
  startNewGame();
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
      email: currentUser.email,
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
