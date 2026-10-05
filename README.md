# CJID October General Meeting Quiz 🚂

A fast-paced, interactive trivia game built for the CJID October General Meeting. Features a live leaderboard, email-agnostic entry, and a password-protected admin panel.

## Features
- **Open Entry System:** Players simply enter their Name and Email to play. 
- **Global Leaderboard:** Real-time top 5 score tracking using Firestore.
- **Advanced Admin Panel:**
  - Add, delete, edit, reorder, or reset custom questions.
  - **Full Rankings Dashboard:** View a complete, ranked list of every participant (1st through Last), displaying their exact submission time down to the second.
  - **Data Wipe:** Clear out all test or past event results from the database with a click (Password protected).
- **Vanilla Tech Stack:** Zero dependencies, lightweight HTML/CSS/JS.

## Setup Instructions

1. **Firebase Configuration**
   - Create a project on [Firebase Console](https://console.firebase.google.com).
   - Enable **Firestore Database** (start in Test Mode).
   - Copy your Web App config keys.
   
2. **Local Environment**
   - Clone this repository.
   - Open `app.js` and paste your Firebase config keys into the `firebaseConfig` object at the top of the file.

3. **Deployment**
   - This project is purely static and can be deployed to **Firebase Hosting**, **Vercel**, or **GitHub Pages**.
