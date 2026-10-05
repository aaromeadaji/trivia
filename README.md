# Workplace Trivia Challenge 🏆

A fast-paced, interactive trivia game built for organizational team-building. Features a live leaderboard, Google Workspace authentication, and a built-in admin panel to manage questions.

## Features
- **Google SSO:** Secure login using Google Workspace accounts via Firebase Auth.
- **Global Leaderboard:** Real-time top 5 score tracking using Firestore.
- **Admin Panel:** Add, delete, or reset custom questions directly from the UI.
- **Vanilla Tech Stack:** Zero dependencies, lightweight HTML/CSS/JS.

## Setup Instructions

1. **Firebase Configuration**
   - Create a project on [Firebase Console](https://console.firebase.google.com).
   - Enable **Google Authentication** and **Firestore Database**.
   - Copy your Web App config keys.
   
2. **Local Environment**
   - Clone this repository.
   - Open `app.js` and paste your Firebase config keys into the `firebaseConfig` object at the top of the file.

3. **Deployment**
   - This project is purely static and can be deployed to **Firebase Hosting**, **Vercel**, or **GitHub Pages**.
   - Ensure you restrict Google Auth to your domain via Google Cloud Console > OAuth Consent Screen > Internal.
