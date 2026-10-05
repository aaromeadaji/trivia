# CJID October General Meeting Quiz 🚂

A fast-paced, interactive trivia game built for the CJID October General Meeting. Features a live leaderboard, email-agnostic entry, and a password-protected admin panel to manage questions.

## Features
- **Open Entry System:** Players simply enter their Name and Email to play. No strict passwords or Google/SSO required.
- **Global Leaderboard:** Real-time top 5 score tracking using Firestore.
- **Secured Admin Panel:** Add, delete, or reset custom questions directly from the UI (Password protected).
- **Vanilla Tech Stack:** Zero dependencies, lightweight HTML/CSS/JS.

## Setup Instructions

1. **Firebase Configuration**
   - Create a project on [Firebase Console](https://console.firebase.google.com).
   - Enable **Firestore Database** (start in Test Mode to allow open writes from the game).
   - Copy your Web App config keys.
   
2. **Local Environment**
   - Clone this repository.
   - Open `app.js` and paste your Firebase config keys into the `firebaseConfig` object at the top of the file.

3. **Deployment**
   - This project is purely static and can be deployed to **Firebase Hosting**, **Vercel**, or **GitHub Pages**.
