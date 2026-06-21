require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'IdeaSparkDB'
});

db.connect((err) => {
    if (err) console.error('❌ DB Error:', err.message);
    else console.log('✅ Connected to MySQL Database!');
});

// 1. REGISTER
app.post('/register', (req, res) => {
    // Frontend se ye sab aa raha hai
    const { username, email, password, role, skills, bio } = req.body;

    const sql = "INSERT INTO Users (username, email, password, role, skills, bio) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [username, email, password, role, skills, bio], (err, result) => {
        if (err) {
            console.error("❌ Registration Error:", err);
            return res.status(500).json({ message: "Registration Error: " + err.message });
        }
        res.status(201).json({ message: "User Registered Successfully!" });
    });
});

// 2. LOGIN
// 2. LOGIN (FIXED: Now checks Role too)
app.post('/login', (req, res) => {
    // 1. Get role from frontend request
    const { email, password, role } = req.body; 

    // 2. Add "AND role = ?" to the SQL query
    const sql = "SELECT user_id, username, email, role FROM Users WHERE email = ? AND password = ? AND role = ?";
    
    // 3. Pass 'role' into the query parameters
    db.query(sql, [email, password, role], (err, data) => {
        if (err) return res.status(500).json(err);
        
        if (data.length > 0) {
            return res.json({ message: "Login Successful", user: data[0] });
        } else {
            // Now this will trigger if the Email/Pass is right BUT the Role is wrong
            return res.status(401).json({ message: "Invalid credentials or Role mismatch" });
        }
    });
});
// 3. CREATE IDEA
app.post('/create-idea', (req, res) => {
    // 1. Let's see EXACTLY what the backend is seeing
    console.log("---------------------------");
    console.log("BODY ARRIVED:", req.body);
    
    const { title, description, category, tags, user_id } = req.body;

    // 2. If it's still null here, we catch it before it hits SQL
    if (!user_id) {
        console.log("❌ CRITICAL ERROR: user_id is missing from the request!");
        return res.status(400).json({ error: "User ID is required bubbs!" });
    }

    // 3. Force the insert with every single column named
    const sql = `INSERT INTO Ideas 
        (title, description, category, tags, user_id, current_funding, funding_goal) 
        VALUES (?, ?, ?, ?, ?, 0, 50000)`;
    
    db.query(sql, [title, description, category, tags, user_id], (err, result) => {
        if (err) {
            console.error("❌ SQL ERROR:", err);
            return res.status(500).json(err);
        }
        console.log("✅ DATABASE SAVED! ID:", user_id);
        res.status(201).json({ message: "Success", idea_id: result.insertId });
    });
});

// 4. GET IDEAS
app.get('/ideas', (req, res) => {
    // 💡 Logic: Aapka existing popularity formula + Upvotes/Downvotes added
    const sql = `
        SELECT i.*, 
        (SELECT COUNT(*) FROM Feedback f WHERE f.idea_id = i.idea_id) as feedback_count,
        (SELECT COUNT(*) FROM Votes v WHERE v.idea_id = i.idea_id AND v.vote_type = 'Upvote') as upvotes,
        (SELECT COUNT(*) FROM Votes v WHERE v.idea_id = i.idea_id AND v.vote_type = 'Downvote') as downvotes,
        (i.current_funding / NULLIF(i.funding_goal, 0)) as funding_ratio
        FROM Ideas i 
        WHERE i.status = 'Active'
        ORDER BY (
            (SELECT COUNT(*) FROM Feedback f WHERE f.idea_id = i.idea_id) + 
            (SELECT COUNT(*) FROM Votes v WHERE v.idea_id = i.idea_id AND v.vote_type = 'Upvote') + 
            ((i.current_funding / NULLIF(i.funding_goal, 0)) * 10)
        ) DESC`;

    db.query(sql, (err, data) => {
        if (err) {
            console.error("❌ Ideas Query Error:", err);
            return res.status(500).json(err);
        }
        res.json(data);
    });
});

// 5. DELETE IDEA
app.delete('/delete-idea/:id', (req, res) => {
    const sql = "DELETE FROM ideas WHERE idea_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Deleted!" });
    });
});

// 6. UPDATE IDEA
app.put('/update-idea/:id', (req, res) => {
    const { title, description, category } = req.body;
    const sql = "UPDATE ideas SET title = ?, description = ?, category = ? WHERE idea_id = ?";
    db.query(sql, [title, description, category, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Updated!" });
    });
});

// 8. USERS (TEAM)
app.get('/users', (req, res) => {
    const sql = "SELECT user_id, username, email, role, created_at FROM users";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 9. INVEST MONEY
// 9. INVEST MONEY
app.post('/invest', (req, res) => {
    const { idea_id, amount } = req.body;
    
    // Logic: Idea table mein current_funding update karna
    const sql = "UPDATE Ideas SET current_funding = COALESCE(current_funding, 0) + ? WHERE idea_id = ?";
    
    db.query(sql, [amount, idea_id], (err, result) => {
        if (err) {
            console.error("❌ DB Error:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "Investment success!" });
    });
});
// 🤖 AI MENTOR ROUTE
app.post('/ask-ai', (req, res) => {
    const { message } = req.body;
    // You can replace this later with actual Gemini/OpenAI calls
    const reply = "That's a great question! As your AI Mentor, I suggest looking into your market fit and current funding progress.";
    res.json({ reply: reply });
});
// 🏠 CONTEXT-AWARE ADAPTATION ROUTE [cite: 79, 309]
app.post('/update-context', (req, res) => {
    const { idea_id, lighting, noise } = req.body;
    let action = "Normal Mode";

    // 💡 Logic: If light is low, increase brightness [cite: 454, 610]
    if (lighting < 30) action = "Increase AR Brightness";
    
    // 🔊 Logic: If noise is high, switch to Text Mode [cite: 454, 611]
    if (noise > 70) action = "Switch to Text-Only Communication";

    const sql = "INSERT INTO SessionContext (idea_id, lighting_level, noise_level, adaptation_action) VALUES (?, ?, ?, ?)";
    db.query(sql, [idea_id, lighting, noise, action], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Context Updated", suggestion: action });
    });
});
// 👥 1. GET ALL TEAMS
// ✅ 7. GET TEAMS (FIXED: Fetches from Team_Members, NOT Requests)
app.get('/teams/:user_id', (req, res) => {
    const userId = req.params.user_id;

    const sql = `
        SELECT 
            t.team_id, 
            t.team_name, 
            tm.role_in_team as role, 
            t.visibility,
            'Active' as project_title,
            t.create_date
        FROM Teams t
        JOIN Team_Members tm ON t.team_id = tm.team_id
        WHERE tm.user_id = ?
    `;

    db.query(sql, [userId], (err, data) => {
        if (err) {
            console.error("❌ Team Fetch Error:", err);
            return res.status(500).json(err);
        }
        console.log(`✅ Found ${data.length} teams for user ${userId}`);
        res.json(data);
    });
});

// 🏗️ 2. CREATE A NEW TEAM
// 🏗️ 2. CREATE A NEW TEAM (FIXED)
app.post('/create-team', (req, res) => {
    const { team_name, visibility, creator_id } = req.body; // Ensure frontend sends creator_id

    // Step 1: Create the Team
    const sqlTeam = "INSERT INTO Teams (team_name, visibility, creator_id) VALUES (?, ?, ?)";
    
    db.query(sqlTeam, [team_name, visibility, creator_id], (err, result) => {
        if (err) {
            console.error("❌ Team Creation Error:", err);
            return res.status(500).json(err);
        }

        const newTeamId = result.insertId;

        // Step 2: IMMEDIATELY add the Creator to the Team_Members table
        // This is the step your code was missing!
        const sqlMember = "INSERT INTO Team_Members (team_id, user_id, role_in_team) VALUES (?, ?, 'Leader')";

        db.query(sqlMember, [newTeamId, creator_id], (err, memberResult) => {
            if (err) {
                console.error("❌ Member Join Error:", err);
                return res.status(500).json(err);
            }
            res.status(201).json({ message: "Team Created and Joined!", team_id: newTeamId });
        });
    });
});

// 🌡️ 3. UPDATE SESSION CONTEXT (AR ADAPTATION)
app.post('/update-context', (req, res) => {
    const { idea_id, lighting, noise } = req.body;
    let action = "Normal Mode";

    // Detect environment to enable context-aware behavior [cite: 79, 453]
    if (lighting < 30) action = "Increase AR Brightness"; // Low light adaptation [cite: 454]
    if (noise > 70) action = "Switch to Text-Only Mode"; // High noise adaptation [cite: 454]

    const sql = "INSERT INTO SessionContext (idea_id, lighting_level, noise_level, adaptation_action) VALUES (?, ?, ?, ?)";
    db.query(sql, [idea_id, lighting, noise, action], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Environment Adapted", action: action });
    });
});
app.post('/register', (req, res) => {
    const { username, email, password, role, skills, bio } = req.body;

    // Check karo ke yahan 'password' likha hai ya 'password_hash'
    // Humne table mein 'password' kar diya hai toh ye ab sahi chalega
    const sql = "INSERT INTO Users (username, email, password, role, skills, bio) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [username, email, password, role, skills, bio], (err, result) => {
        if (err) {
            console.error("❌ SQL Error:", err.sqlMessage); 
            return res.status(500).json({ message: "Registration Error: " + err.sqlMessage });
        }
        res.status(201).json({ message: "Account Created! Ab login karo bubbs! ✨" });
    });
});

// 📜 2. GET FEEDBACK FOR AN IDEA
app.get('/feedback/:idea_id', (req, res) => {
    const sql = `
        SELECT f.*, u.username 
        FROM Feedback f 
        JOIN users u ON f.user_id = u.user_id 
        WHERE f.idea_id = ? 
        ORDER BY f.timestamp DESC`;
    db.query(sql, [req.params.idea_id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});
// 🌫️ TOGGLE WORKSPACE SESSION STATE
app.post('/toggle-session/:id', (req, res) => {
    const { state } = req.body; // 'Active' or 'Inactive'
    const sql = "UPDATE Ideas SET session_state = ? WHERE idea_id = ?";
    db.query(sql, [state, req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: `Session is now ${state}` });
    });
});
// 1. Post Feedback (Existing logic)
// GET ALL REVIEWS FOR A SPECIFIC IDEA
app.get('/get-feedback/:ideaId', (req, res) => {
    const { ideaId } = req.params;
    
    // We use "Users" (Capital U) to match your most recent successful manual query
    const sql = `
        SELECT f.feedback_id, f.comment_text, f.rating, f.timestamp, u.username 
        FROM Feedback f 
        JOIN Users u ON f.user_id = u.user_id 
        WHERE f.idea_id = ? 
        ORDER BY f.timestamp DESC`;

    db.query(sql, [ideaId], (err, data) => {
        if (err) {
            console.error("❌ SQL Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Fetched ${data.length} reviews for idea ${ideaId}`);
        res.json(data);
    });
});

// POST FEEDBACK
app.post('/post-feedback', (req, res) => {
    const { idea_id, user_id, comment_text, rating } = req.body;
    const sql = "INSERT INTO Feedback (idea_id, user_id, comment_text, rating) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [idea_id, user_id, comment_text, rating], (err, result) => {
        if (err) {
            console.error("❌ SQL Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Feedback saved!" });
    });
});

// 📩 Request to Join Team
app.post('/join-request', (req, res) => {
    const { idea_id, user_id } = req.body;
    
    // Check if already requested
    const checkSql = "SELECT * FROM TeamRequests WHERE idea_id = ? AND user_id = ?";
    db.query(checkSql, [idea_id, user_id], (err, result) => {
        if (result.length > 0) return res.status(400).json({ message: "Already requested bubbs!" });

        const sql = "INSERT INTO TeamRequests (idea_id, user_id) VALUES (?, ?)";
        db.query(sql, [idea_id, user_id], (err, data) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Request sent successfully! 🚀" });
        });
    });
});

// 📥 Get requests received for MY ideas
app.get('/my-requests/:ownerId', (req, res) => {
    const sql = `
        SELECT tr.request_id, tr.status, tr.request_date, u.username, i.title 
        FROM TeamRequests tr
        JOIN Ideas i ON tr.idea_id = i.idea_id
        JOIN Users u ON tr.user_id = u.user_id
        WHERE i.user_id = ? AND tr.status = 'Pending'
    `;
    db.query(sql, [req.params.ownerId], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// ✅ Accept or ❌ Reject Request
app.post('/handle-request', (req, res) => {
    const { request_id, status } = req.body; // status will be 'Accepted' or 'Rejected'
    const sql = "UPDATE TeamRequests SET status = ? WHERE request_id = ?";
    
    db.query(sql, [status, request_id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: `Request ${status} successfully!` });
    });
});
app.get('/analytics', (req, res) => {
    // 1. Total Capital Raised
    const q1 = "SELECT SUM(current_funding) as total_capital FROM Ideas";
    // 2. Total Ideas count
    const q2 = "SELECT COUNT(*) as total_ideas FROM Ideas";
    // 3. Total Users count
    const q3 = "SELECT COUNT(*) as total_users FROM Users";
    // 4. Trending Idea (Jis ki funding sab se zyada ho)
    const q4 = "SELECT title FROM Ideas ORDER BY current_funding DESC LIMIT 1";
    // 5. Category distribution
    const q5 = "SELECT category, COUNT(*) as count FROM Ideas GROUP BY category";

    db.query(q1, (err, r1) => {
        db.query(q2, (err, r2) => {
            db.query(q3, (err, r3) => {
                db.query(q4, (err, r4) => {
                    db.query(q5, (err, r5) => {
                        if (err) return res.status(500).json(err);
                        
                        const capital = parseFloat(r1[0].total_capital) || 0;
                        const ideasCount = r2[0].total_ideas || 0;
                        const usersCount = r3[0].total_users || 0;
                        const trending = r4[0]?.title || "None yet";

                        console.log("📊 Analytics Sent:", { capital, ideasCount });

                        res.json({
                            total_capital: capital,
                            total_ideas: ideasCount,
                            total_users: usersCount,
                            trending_idea: trending,
                            categories: r5 || []
                        });
                    });
                });
            });
        });
    });
});
// 🏆 Get all successfully formed teams (Accepted Requests)
app.get('/teams/:userId', (req, res) => {
    const userId = req.params.userId;
    
    // 💡 Yeh query ab Creator aur Member dono ke liye teams layegi
    const sql = `
        SELECT 
            tr.request_id, 
            u.username as member_name, 
            u.role, 
            i.title as project_title, 
            tr.request_date
        FROM TeamRequests tr
        JOIN Ideas i ON tr.idea_id = i.idea_id
        JOIN Users u ON tr.user_id = u.user_id
        WHERE (i.user_id = ? OR tr.user_id = ?) 
        AND tr.status = 'Accepted'
    `;

    db.query(sql, [userId, userId], (err, data) => {
        if (err) {
            console.error("❌ Team Fetch Error:", err);
            return res.status(500).json(err);
        }
        console.log("✅ Teams found for user:", data.length);
        res.json(data);
    });
});

// 🗳️ Vote for an Idea
// 🗳️ Voting API
app.post('/vote', (req, res) => {
    const { idea_id, user_id, vote_type } = req.body;

    if (!idea_id || !user_id || !vote_type) {
        return res.status(400).json({ error: "Missing data bubbs!" });
    }

    const sql = `
        INSERT INTO Votes (idea_id, user_id, vote_type) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE vote_type = VALUES(vote_type)
    `;

    db.query(sql, [idea_id, user_id, vote_type], (err, result) => {
        if (err) {
            console.error("❌ SQL Error:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "Vote registered! 🚀" });
    });
});

// 📊 Get Vote Counts (Isse apne existing /ideas route mein integrate kar lena)
app.get('/idea-votes/:idea_id', (req, res) => {
    const sql = `SELECT 
        SUM(CASE WHEN vote_type = 'Upvote' THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote_type = 'Downvote' THEN 1 ELSE 0 END) as downvotes
        FROM Votes WHERE idea_id = ?`;
    db.query(sql, [req.params.idea_id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data[0]);
    });
});
// ===================================================
// 🚀 NEW INVITATION SYSTEM (Add this to server.js)
// ===================================================

// 1. SEND INVITATION (Leader -> User)
app.post('/invite-user', (req, res) => {
    const { team_id, target_user_id } = req.body;
    
    // Check if already invited
    const checkSql = "SELECT * FROM Team_Invitations WHERE team_id = ? AND invited_user_id = ? AND status = 'Pending'";
    
    db.query(checkSql, [team_id, target_user_id], (err, result) => {
        if (result.length > 0) return res.status(400).json({ message: "Already invited!" });

        const sql = "INSERT INTO Team_Invitations (team_id, invited_user_id) VALUES (?, ?)";
        db.query(sql, [team_id, target_user_id], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Invitation Sent Successfully!" });
        });
    });
});

// 2. GET MY INVITATIONS (User Inbox)
app.get('/my-invitations/:user_id', (req, res) => {
    const sql = `
        SELECT i.invitation_id, t.team_name, u.username as inviter_name 
        FROM Team_Invitations i
        JOIN Teams t ON i.team_id = t.team_id
        JOIN Users u ON t.creator_id = u.user_id
        WHERE i.invited_user_id = ? AND i.status = 'Pending'
    `;
    db.query(sql, [req.params.user_id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// 3. ACCEPT/REJECT INVITATION
app.post('/respond-invitation', (req, res) => {
    const { invitation_id, status } = req.body; // 'Accepted' or 'Rejected'

    // A. Update Status
    const updateSql = "UPDATE Team_Invitations SET status = ? WHERE invitation_id = ?";
    
    db.query(updateSql, [status, invitation_id], (err, result) => {
        if (err) return res.status(500).json(err);

        // B. If Accepted, Add to Team Members
        if (status === 'Accepted') {
            const getInviteSql = "SELECT team_id, invited_user_id FROM Team_Invitations WHERE invitation_id = ?";
            db.query(getInviteSql, [invitation_id], (err, inviteData) => {
                if(inviteData.length === 0) return res.json({message: "Error finding invite"});

                const { team_id, invited_user_id } = inviteData[0];
                const insertMember = "INSERT INTO Team_Members (team_id, user_id, role_in_team) VALUES (?, ?, 'Member')";
                
                db.query(insertMember, [team_id, invited_user_id], (err, finalRes) => {
                    res.json({ message: "Welcome to the team! 🎉" });
                });
            });
        } else {
            res.json({ message: "Invitation Rejected." });
        }
    });
});

// 4. GET TEAM MEMBERS (For display)
app.get('/team-members/:team_id', (req, res) => {
    const sql = `
        SELECT u.username, u.role, tm.role_in_team 
        FROM Team_Members tm
        JOIN Users u ON tm.user_id = u.user_id
        WHERE tm.team_id = ?`;
    db.query(sql, [req.params.team_id], (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
