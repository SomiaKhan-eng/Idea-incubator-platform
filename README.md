<div align="center">

# 💡 IdeaSpark — Idea Incubator Platform

### A full-stack platform for pitching, growing, and connecting project ideas

![Node.js](https://img.shields.io/badge/Node.js-6E40C9?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-6E40C9?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-6E40C9?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-6E40C9?style=for-the-badge&logo=javascript&logoColor=white)

</div>

---

## 💡 About

IdeaSpark is a platform built for students and creators who have ideas but need a space to develop, pitch, and connect them with the right people — a mini startup incubator with funding tracking, team formation, and voting built in.

The platform supports the full idea lifecycle: pitch → upvote/downvote → team formation via invitations → investment tracking → analytics.

---

## ✨ Features

- **Idea Dashboard** — submit, view, and rank ideas by a popularity score (feedback + upvotes + funding ratio)
- **Voting System** — upvote / downvote on ideas, with live vote counts
- **Investment Tracking** — log mock investments and track funding progress toward each idea's goal
- **Team Formation** — send/accept/reject team invitations, view team members per idea
- **Request Inbox** — owners can view and respond to incoming team requests
- **Analytics Dashboard** — total capital raised, total ideas, total users, trending idea, category breakdown
- **Authentication** — registration and role-based login (Creator / Investor / Mentor / Admin)
- **AI Mentor (in progress)** — `@google/generative-ai` is wired into the project; the current `/ask-ai` route returns a fixed guidance message while full Gemini-powered responses are being built out

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML · CSS · JavaScript |
| Backend | Node.js · Express |
| Database | MySQL |
| Auth | bcrypt |
| Planned AI | Google Gemini API |

---

## 🗄️ Database

Relational MySQL schema (`IdeaSpark.Db`) covering users, ideas, investments, votes, teams, team members, team requests/invitations, and session context — with foreign key constraints enforcing referential integrity across the platform.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/SomiaKhan-eng/Idea-incubator-platform.git
cd Idea-incubator-platform

# Install dependencies
npm install

# Set up your environment variables
cp .env.example .env
# then edit .env with your own MySQL credentials

# Import the database schema
# Run IdeaSpark.Db in MySQL Workbench or CLI

# Start the server
node server.js
```

Then open `http://localhost:8081` in your browser.

> ⚠️ Never commit your real `.env` file — it's already excluded via `.gitignore`. Use `.env.example` as the template.

---

## 📁 Project Structure

```
Idea-incubator-platform/
├── public/
│   ├── index.html          # Landing page
│   ├── dashboard.html      # Idea dashboard
│   ├── marketplace.html    # Idea marketplace
│   ├── ai-mentor.html      # AI mentor interface
│   ├── analytics.html      # Analytics view
│   ├── team.html           # Team management
│   └── login / register    # Auth pages
├── server.js                # Main Express server
├── IdeaSpark.Db              # Database schema
├── .env.example              # Environment variable template
└── package.json
```

---

## 🚧 Status

Core features (ideas, voting, investments, teams, analytics) are working end to end. AI Mentor currently returns a static response — full Gemini integration is the next milestone.

---

## 👩‍💻 Author

**Somia Khan** — [GitHub](https://github.com/SomiaKhan-eng)
