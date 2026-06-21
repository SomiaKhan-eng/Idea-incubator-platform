const API_BASE_URL = "http://localhost:8081";

// --- 1. Custom Modal Component ---
function FeedbackModal({ isOpen, type, message, onClose }) {
    if (!isOpen) return null;

    const isSuccess = type === 'success';
    const title = isSuccess ? 'Success!' : 'Ooops!';
    
    const icon = isSuccess ? (
        <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ) : (
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    );

    const buttonGradient = isSuccess ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 border border-white/50">
                {icon}
                <h3 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                    {title}
                </h3>
                <p className="text-gray-600 mb-6 font-medium">
                    {message}
                </p>
                <button 
                    onClick={onClose}
                    className={`w-full py-3 rounded-xl text-white font-bold shadow-lg transform active:scale-95 transition-all bg-gradient-to-r ${buttonGradient}`}
                >
                    {isSuccess ? 'Continue' : 'Try Again'}
                </button>
            </div>
        </div>
    );
}

// --- 2. Main Team Component ---
function TeamFormation() {
    const [users, setUsers] = React.useState([]);
    const [teams, setTeams] = React.useState([]);
    const [invitations, setInvitations] = React.useState([]);
    const [viewMode, setViewMode] = React.useState('Users'); // 'Users', 'Teams', 'Inbox'
    const [filter, setFilter] = React.useState('All');
    
    // Modal States
    const [showTeamModal, setShowTeamModal] = React.useState(false);
    const [inviteModal, setInviteModal] = React.useState({ show: false, targetUserId: null, targetUserName: '' });
    
    const [newTeam, setNewTeam] = React.useState({ team_name: '', visibility: 'Public' });

    // Feedback Modal State
    const [modal, setModal] = React.useState({
        isOpen: false,
        type: 'success',
        message: '',
        onClose: null
    });

    const closeModal = () => {
        if (modal.onClose) modal.onClose();
        setModal({ ...modal, isOpen: false, onClose: null });
    };

    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // --- DATA LOADING ---
    const loadAllData = () => {
        if (!user.user_id) return;

        // 1. Fetch Users
        fetch(`${API_BASE_URL}/users`).then(res => res.json()).then(setUsers).catch(console.error);

        // 2. Fetch Teams (With Members)
        fetch(`${API_BASE_URL}/teams/${user.user_id}`)
            .then(res => res.json())
            .then(async (data) => {
                const teamsWithMembers = await Promise.all(data.map(async (team) => {
                    const memRes = await fetch(`${API_BASE_URL}/team-members/${team.team_id}`);
                    const members = await memRes.json();
                    return { ...team, members };
                }));
                setTeams(teamsWithMembers);
            })
            .catch(console.error);

        // 3. Fetch Invitations
        fetch(`${API_BASE_URL}/my-invitations/${user.user_id}`)
            .then(res => res.json())
            .then(setInvitations)
            .catch(console.error);
    };

    React.useEffect(() => { loadAllData(); }, []);

    // --- ACTIONS ---

    // 1. Create Team
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const teamPayload = { ...newTeam, creator_id: user.user_id };
            const response = await fetch(`${API_BASE_URL}/create-team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamPayload)
            });

            if (response.ok) {
                setShowTeamModal(false);
                setNewTeam({ team_name: '', visibility: 'Public' });
                setModal({
                    isOpen: true, type: 'success', message: `Team "${newTeam.team_name}" Created!`,
                    onClose: () => { setViewMode('Teams'); loadAllData(); }
                });
            } else {
                throw new Error("Failed to create team");
            }
        } catch (error) {
            setModal({ isOpen: true, type: 'error', message: "Server error.", onClose: null });
        }
    };

    // 2. Send Invitation
    const sendInvite = async (teamId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/invite-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team_id: teamId, target_user_id: inviteModal.targetUserId })
            });
            const data = await response.json();
            
            setInviteModal({ show: false, targetUserId: null, targetUserName: '' });
            
            setModal({
                isOpen: true,
                type: response.ok ? 'success' : 'error',
                message: data.message,
                onClose: null
            });
        } catch (err) {
            console.error(err);
        }
    };

    // 3. Accept/Reject Invitation
    const handleResponse = async (invitationId, status) => {
        try {
            await fetch(`${API_BASE_URL}/respond-invitation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitation_id: invitationId, status })
            });
            loadAllData();
            setModal({ isOpen: true, type: 'success', message: `Invitation ${status}!`, onClose: null });
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = filter === 'All' ? users : users.filter(u => u.role === filter);
    const getRoleBadge = (role) => {
        if (role === 'Investor') return 'bg-emerald-500/20 text-emerald-800 border-emerald-200/50';
        if (role === 'Creator') return 'bg-indigo-500/20 text-indigo-800 border-indigo-200/50';
        return 'bg-blue-500/20 text-blue-800 border-blue-200/50';
    };

    return (
        <div className="flex h-screen overflow-hidden">
            
            {/* Feedback Modal Instance */}
            <FeedbackModal isOpen={modal.isOpen} type={modal.type} message={modal.message} onClose={closeModal} />

            {/* GLASS SIDEBAR */}
            <aside className="w-64 glass-sidebar hidden md:flex flex-col p-6 z-10">
                <div className="text-3xl font-bold mb-10 text-indigo-600 tracking-tight">IdeaSpark</div>
                <nav className="space-y-3 flex-1">
                    <button onClick={() => window.location.href='dashboard.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">My Ideas</button>
                    <button onClick={() => window.location.href='ai-mentor.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">AI Mentor</button>
                    <button onClick={() => setViewMode('Teams')} className="w-full text-left py-3 px-5 bg-indigo-600 text-white rounded-xl font-medium transition-all glass-button">Team Formation</button>
                    
                    {/* Inbox Button */}
                    <button onClick={() => setViewMode('Inbox')} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button flex justify-between items-center">
                        Inbox
                        {invitations.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{invitations.length}</span>}
                    </button>

                    {/* ✨ FIXED: Added Analytics Button */}
                    <button onClick={() => window.location.href='analytics.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        Growth Analytics
                    </button>

                    {/* ✨ FIXED: Added Marketplace Button */}
                    <button onClick={() => window.location.href='marketplace.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        Marketplace
                    </button>
                </nav>
                <div className="mt-auto pt-6 border-t border-gray-200/50">
                    <p className="text-[10px] font-bold text-indigo-600 mb-2 px-2 uppercase tracking-widest">{user.role}</p>
                    <button onClick={() => { localStorage.removeItem('user'); window.location.href='login.html'; }} className="w-full py-3 px-5 text-red-500 hover:bg-red-50 rounded-xl font-bold text-left text-sm transition-all">Log Out</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-8 overflow-y-auto relative z-0">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white drop-shadow-md">Collaboration Hub</h1>
                        <p className="text-white/80 text-lg mt-1 font-light">Join teams or find individual experts.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="glass-panel p-1.5 rounded-xl flex gap-1">
                            <button onClick={() => setViewMode('Users')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'Users' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Users</button>
                            <button onClick={() => setViewMode('Teams')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'Teams' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>My Teams</button>
                            <button onClick={() => setViewMode('Inbox')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'Inbox' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>
                                Inbox {invitations.length > 0 && `(${invitations.length})`}
                            </button>
                        </div>
                        <button onClick={() => setShowTeamModal(true)} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition">Create Team</button>
                    </div>
                </div>

                {/* 👤 USERS VIEW */}
                {viewMode === 'Users' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredUsers.filter(u => u.user_id !== user.user_id).map((u) => (
                            <div key={u.user_id} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center transition-all hover:scale-[1.02] shadow-xl">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700 mb-3 uppercase shadow-inner">
                                    {u.username.substring(0, 2)}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 leading-tight">{u.username}</h3>
                                <span className={`mt-1 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getRoleBadge(u.role)}`}>{u.role}</span>
                                <p className="text-gray-500 text-xs mt-3 mb-4 line-clamp-2 h-8 italic">"{u.bio || 'Innovation enthusiast.'}"</p>
                                <button 
                                    onClick={() => setInviteModal({ show: true, targetUserId: u.user_id, targetUserName: u.username })} 
                                    className="mt-auto w-full py-2.5 bg-white border border-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm"
                                >
                                    Invite to Team
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 🏆 TEAMS VIEW */}
                {viewMode === 'Teams' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {teams.map((t, index) => (
                            <div key={index} className="glass-panel p-6 rounded-2xl border-l-8 border-emerald-500 shadow-xl relative overflow-hidden bg-white/80">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{t.team_name}</h3>
                                <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest">Visibility: {t.visibility}</p>
                                
                                <div className="bg-indigo-50/50 rounded-xl p-3">
                                    <h4 className="text-xs font-bold text-indigo-800 mb-2 uppercase">Members:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {t.members && t.members.map((m, i) => (
                                            <span key={i} className="text-xs bg-white border border-indigo-100 px-2 py-1 rounded-md text-gray-600 font-medium">
                                                {m.username} ({m.role_in_team})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 📩 INBOX VIEW */}
                {viewMode === 'Inbox' && (
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Team Invitations</h2>
                        {invitations.length === 0 ? (
                            <div className="glass-panel p-10 text-center rounded-2xl">
                                <p className="text-gray-500 text-lg">No pending invitations.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {invitations.map(inv => (
                                    <div key={inv.invitation_id} className="glass-panel p-6 rounded-2xl flex justify-between items-center shadow-lg">
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-800">Join Team "{inv.team_name}"?</h3>
                                            <p className="text-gray-500 text-sm">Invited by <span className="text-indigo-600 font-medium">{inv.inviter_name}</span></p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleResponse(inv.invitation_id, 'Rejected')} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100">Reject</button>
                                            <button onClick={() => handleResponse(inv.invitation_id, 'Accepted')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold shadow hover:bg-emerald-600">Accept</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* 🆕 SELECT TEAM MODAL (When Clicking Invite) */}
            {inviteModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-2">Invite {inviteModal.targetUserName}</h3>
                        <p className="text-gray-500 text-sm mb-6">Select which team they should join:</p>
                        
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                            {teams.filter(t => t.role === 'Leader').length > 0 ? (
                                teams.filter(t => t.role === 'Leader').map(t => (
                                    <button 
                                        key={t.team_id} 
                                        onClick={() => sendInvite(t.team_id)}
                                        className="w-full p-4 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-left rounded-xl font-medium transition border border-gray-100"
                                    >
                                        {t.team_name}
                                    </button>
                                ))
                            ) : (
                                <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">You must create a team first!</p>
                            )}
                        </div>
                        <button onClick={() => setInviteModal({ show: false, targetUserId: null })} className="w-full py-3 text-gray-400 font-bold hover:text-gray-600">Cancel</button>
                    </div>
                </div>
            )}

            {/* CREATE TEAM MODAL */}
            {showTeamModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel bg-white/95 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-indigo-900 text-center">Form New Team</h2>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <input className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Team Name" value={newTeam.team_name} onChange={e => setNewTeam({...newTeam, team_name: e.target.value})} required />
                            <select className="w-full p-4 border rounded-xl outline-none" value={newTeam.visibility} onChange={e => setNewTeam({...newTeam, visibility: e.target.value})}>
                                <option value="Public">Public Team</option>
                                <option value="Private">Private Team</option>
                            </select>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowTeamModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TeamFormation />);