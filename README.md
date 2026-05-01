# 💡 IdeaSpark — Idea Incubator Platform

> A full-stack platform for pitching, growing, and connecting project ideas — powered by Google Gemini AI.

---

## 💡 About

IdeaSpark is a platform built for students and creators who have ideas but need a space to develop, pitch, and connect them with the right people. Think of it as a mini startup incubator — with an AI mentor built in.

The platform supports the full idea lifecycle: from initial pitch to team building, marketplace listing, and analytics tracking.

---

## ✨ Features

- **Idea Dashboard** — submit, manage and track your ideas in one place
- **AI Mentor** — Google Gemini AI powered mentor that gives feedback and guidance on your ideas
- **Marketplace** — browse and discover ideas from other users
- **Team Management** — build and manage teams around ideas
- **Analytics** — track idea engagement and growth metrics
- **Authentication** — secure login and registration with session management
- **User Profiles** — personalised profiles for idea owners

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML · CSS · JavaScript |
| Backend | Node.js · Express.js |
| Database | MySQL |
| AI Integration | Google Gemini AI |
| Auth | bcrypt · express-session |

---

## 🗄️ Database

The platform uses a relational MySQL database handling users, ideas, teams, and marketplace listings with full CRUD operations and session-based authentication.

---

## 🤖 AI Integration

The AI Mentor feature uses Google's Gemini API to provide contextual feedback on submitted ideas — covering feasibility, market potential, and next steps. It responds based on the idea's description and category.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/SomiaKhan-eng/Idea-incubator-platform.git

# Navigate to project
cd Idea-incubator-platform/IdeaSpark-project

# Install dependencies
npm install

# Set up your environment variables
# Create a .env file with:
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, GEMINI_API_KEY, SESSION_SECRET

# Run the server
node server.js
```

Then open `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
IdeaSpark-project/
├── public/
│   ├── index.html          # Landing page
│   ├── dashboard.html      # Idea dashboard
│   ├── marketplace.html    # Idea marketplace
│   ├── ai-mentor.html      # AI mentor interface
│   ├── analytics.html      # Analytics view
│   ├── team.html           # Team management
│   └── login / register    # Auth pages
├── server.js               # Main Express server
├── IdeaSpark.Db            # Database schema
└── package.json
```

---

## 🚧 Status

Most core features are working. Some features are still being refined.

---



## 📃 Software Design and Architecture Project Documentation.pdf

veiw full documentation: https://drive.google.com/file/d/1X9ee-AcDQzt3J3KHyj2T985UUKz1b4wa/view?usp=drive_link



## 👩‍💻 Author

**Somia Khan** — [GitHub](https://github.com/SomiaKhan-eng)
