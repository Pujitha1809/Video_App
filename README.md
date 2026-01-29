# 🎬 Video App

A full-stack video dashboard application built using React (frontend), Flask (backend), MongoDB, and JWT authentication.

---

## 🚀 Features
- User authentication using JWT
- Add videos using YouTube Video ID
- Auto-fetch thumbnail from YouTube
- Search and sort videos
- Delete videos
- Secure backend APIs

---

## 🛠️ Tech Stack
- Frontend: React
- Backend: Flask (Python)
- Database: MongoDB
- Authentication: JWT

---

## ⚙️ Setup Instructions

### 1. Clone the repository
git clone <your-github-repo-url>
cd Video_App

---

### 2. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

Server runs on:
http://127.0.0.1:5000

---

### 3. Frontend Setup
cd frontend
npm install
npm start

Frontend runs on:
http://localhost:3000

---

### 4. Environment Variables
Create a `.env` file using `.env.example` template.

---

## 📽️ Demo
Recorded Loom video explaining architecture, JWT flow, and YouTube abstraction.

