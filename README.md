# Dynamic Blog Web Application

A modern, responsive blog application built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **Authentication**: Sign up, Login, and Logout functionality.
- **Blog Management**: Create, Read, Update, and Delete (CRUD) blog posts.
- **Rich Text Editor**: Write formatted content using React Quill.
- **Image Upload**: Upload cover images for blog posts via Firebase Storage.
- **Comments**: Real-time comment system for engaging with posts.
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS.

## Prerequisites

- Node.js (v18+)
- Firebase Account

## Setup Instructions

1.  **Clone/Open the project**
    ```bash
    cd FSD_SEE_PROJECT
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```
    *Note: If you encounter peer dependency errors, use:*
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Configure Firebase**
    - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable **Authentication** (Email/Password provider).
    - Enable **Firestore Database** (Start in Test Mode or use provided rules).
    - Enable **Storage** (Start in Test Mode or use provided rules).
    - Copy your Firebase config object from Project Settings.
    - Create a `.env` file in the root directory (copy from `.env` template if available, but for Vite use `VITE_` prefix):

    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## Security Rules

See `firestore.rules` for the recommended security configuration for Firestore and Storage.

## Technologies

- **Frontend**: React, Vite, React Router DOM
- **Styling**: Tailwind CSS, Lucide React (icons)
- **State Management**: Context API (AuthContext)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Editor**: React Quill
