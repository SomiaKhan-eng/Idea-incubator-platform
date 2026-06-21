const API_BASE_URL = "http://localhost:8081";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isInvestor = user.role === 'Investor';
    const isCreator = user.role === 'Creator';

    // State for Modals
    const [showModal, setShowModal] = React.useState(false);
    const [viewingFeedback, setViewingFeedback] = React.useState(null);
    
    // ✨ State for AR Simulation
    const [arView, setArView] = React.useState(null); 

    const [ideas, setIdeas] = React.useState([]);
    const [editingId, setEditingId] = React.useState(null);
    const [idea, setIdea] = React.useState({ title: '', description: '', category: 'Tech', funding_goal: 10000, hashtags: '' });
    
    const [reviewsData, setReviewsData] = React.useState({}); 

    React.useEffect(() => {
        refreshDashboard();
    }, []);

    const refreshDashboard = () => {
        fetch(`${API_BASE_URL}/ideas`)
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) {
                    setIdeas(data);
                    data.forEach(item => {
                        fetch(`${API_BASE_URL}/get-feedback/${item.idea_id}`)
                            .then(res => res.json())
                            .then(reviews => {
                                setReviewsData(prev => ({ ...prev, [item.idea_id]: reviews }));
                            });
                    });
                }
            });
    };

    const handleInvest = async (ideaId) => {
        const amount = prompt("How much do you want to invest? ");
        if (!amount || isNaN(amount) || amount <= 0) return alert("type the right amount please!");
        try {
            const response = await fetch(`${API_BASE_URL}/invest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea_id: ideaId, amount: parseFloat(amount) })
            });
            if (response.ok) { alert("Investment Successful!"); refreshDashboard(); }
        } catch (err) { alert("Investment failed!"); }
    };

    const handleVote = async (ideaId, type) => {
        if (!user.user_id) return alert("first, login please! ");
        try {
            const response = await fetch(`${API_BASE_URL}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea_id: ideaId, user_id: user.user_id, vote_type: type })
            });
            if (response.ok) { console.log(`✅ ${type} registered!`); refreshDashboard(); }
        } catch (err) { console.error("Voting error:", err); }
    };

    const handleSaveIdea = async (e) => {
        e.preventDefault();
        const payload = { ...idea, user_id: user.user_id };
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_BASE_URL}/update-idea/${editingId}` : `${API_BASE_URL}/create-idea`;
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) { setShowModal(false); refreshDashboard(); alert("Idea Saved! ✨"); }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if(confirm("Delete this permanently?")) {
            await fetch(`${API_BASE_URL}/delete-idea/${id}`, { method: 'DELETE' });
            setIdeas(ideas.filter(item => item.idea_id !== id));
        }
    };

    const getAverageStars = (ideaId) => {
        const reviews = reviewsData[ideaId];
        if (!Array.isArray(reviews) || reviews.length === 0) return "New";
        const avg = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
        return avg.toFixed(1) + " ★";
    };

    const renderStars = (count) => {
        return "★".repeat(Math.round(count)) + "☆".repeat(5 - Math.round(count));
    };

    const openEdit = (item) => {
        setIdea({ title: item.title, description: item.description, category: item.category, funding_goal: item.funding_goal || 10000, hashtags: item.hashtags || '' });
        setEditingId(item.idea_id);
        setShowModal(true);
    };

    const openCreate = () => {
        setIdea({ title: '', description: '', category: 'Tech', funding_goal: 10000, hashtags: '' });
        setEditingId(null);
        setShowModal(true);
    };

    const formatMoney = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);

    const getCategoryColor = (cat) => {
        const colors = { 'Tech': 'bg-blue-500/20 text-blue-800', 'Art': 'bg-pink-500/20 text-pink-800', 'Business': 'bg-emerald-500/20 text-emerald-800', 'Social': 'bg-purple-500/20 text-purple-800', 'Health': 'bg-red-500/20 text-red-800' };
        return colors[cat] || 'bg-gray-200 text-gray-700';
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* SIDEBAR */}
            <aside className="w-64 glass-sidebar hidden md:flex flex-col p-6 z-10 bg-white/30 backdrop-blur-lg border-r">
                <div className="text-3xl font-bold mb-10 text-indigo-600 tracking-tight italic">IdeaSpark</div>
                <nav className="space-y-3 flex-1">
                    <button onClick={() => window.location.href='dashboard.html'} className="w-full text-left py-3 px-5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg">Dashboard</button>
                    <button onClick={() => window.location.href='ai-mentor.html'} className="w-full text-left py-3 px-5 text-gray-700 hover:bg-white/60 rounded-xl">AI Mentor</button>
                    <button onClick={() => window.location.href='team.html'} className="w-full text-left py-3 px-5 text-gray-700 hover:bg-white/60 rounded-xl">Team Collaboration</button>
                    <button onClick={() => window.location.href='analytics.html'} className="w-full text-left py-3 px-5 text-gray-700 hover:bg-white/60 rounded-xl">Growth Analytics</button>
                    <button onClick={() => window.location.href='marketplace.html'} className="w-full text-left py-3 px-5 text-gray-700 hover:bg-white/60 rounded-xl">Marketplace</button>
                </nav>
                <div className="mt-auto pt-6 border-t border-gray-200/50">
                    <p className="text-[10px] font-bold text-indigo-600 mb-2 px-2 uppercase tracking-widest">{user.role}</p>
                    <button onClick={() => { localStorage.removeItem('user'); window.location.href='login.html'; }} className="w-full py-3 px-5 text-red-500 hover:bg-red-50 rounded-xl font-bold text-left text-sm transition-all">Log Out</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-8 overflow-y-auto relative">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-white drop-shadow-md">My Dashboard</h1>
                        <p className="text-white/80 text-lg mt-1 font-light">Welcome back, {user?.username}.</p>
                    </div>
                    {isCreator && (
                        <button onClick={openCreate} className="px-8 py-3 bg-white text-indigo-600 rounded-full font-bold shadow-lg hover:scale-105 transition">New Idea</button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ideas.map((item) => (
                        <div key={item.idea_id} className="glass-panel rounded-2xl p-6 flex flex-col h-full bg-white/70 backdrop-blur-md shadow-xl relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase border ${getCategoryColor(item.category)}`}>{item.category}</span>
                                {String(user.user_id) === String(item.user_id) && (
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(item)} className="p-1.5 bg-white text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100">Edit</button>
                                        <button onClick={() => handleDelete(item.idea_id)} className="p-1.5 bg-white text-red-500 rounded-lg text-[10px] font-bold border border-red-100">Delete</button>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">{item.title}</h3>
                            {item.hashtags && (
                                <div className="text-[11px] text-indigo-500 font-bold mb-3 italic">
                                    {item.hashtags.split(' ').map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}
                                </div>
                            )}
                            <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded-lg text-[10px] font-bold inline-block w-fit mb-4">{getAverageStars(item.idea_id)}</div>
                            <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-1">{item.description}</p>

                            <div className="flex items-center gap-4 mb-4 bg-gray-50 p-2 rounded-xl">
                                <button onClick={() => handleVote(item.idea_id, 'Upvote')} className="flex items-center gap-1 hover:scale-110 transition">👍 <span className="text-xs font-bold text-green-600">{item.upvotes || 0}</span></button>
                                <button onClick={() => handleVote(item.idea_id, 'Downvote')} className="flex items-center gap-1 hover:scale-110 transition">👎 <span className="text-xs font-bold text-red-600">{item.downvotes || 0}</span></button>
                                <div className="text-[10px] text-gray-400 ml-auto uppercase font-black">Poll</div>
                            </div>

                            <button onClick={() => setViewingFeedback(item.idea_id)} className="w-full mb-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-[11px] border border-indigo-100 hover:bg-indigo-100 transition">
                                💬 View Community Feedback ({reviewsData[item.idea_id]?.length || 0})
                            </button>

                            {isInvestor && (
                                <button onClick={() => handleInvest(item.idea_id)} className="w-full mb-3 py-2 bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-lg hover:bg-emerald-600 transition active:scale-95">💰 Invest Now</button>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                {/* 🕶️ AR BUTTON - Styled with Gradient */}
                                <button 
                                    onClick={() => setArView(item)}
                                    className="w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                                >
                                    <span className="animate-pulse">⦿</span> Enter AR Workspace
                                </button>

                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="text-gray-400 font-bold uppercase tracking-wider font-black">Raised: {formatMoney(item.current_funding)}</span>
                                    <span className="text-indigo-600 font-bold">{Math.round((parseFloat(item.current_funding) / (parseFloat(item.funding_goal) || 10000)) * 100)}%</span>
                                </div>
                                <div className="w-full bg-white/40 rounded-full h-1.5 overflow-hidden border">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500" style={{ width: `${Math.min((parseFloat(item.current_funding) / (parseFloat(item.funding_goal) || 10000)) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 🕶️ AR WORKSPACE OVERLAY (Corrected for Idea Incubator) */}
                {arView && (
                    <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-4">
                        
                        {/* 1. Header Bar */}
                        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-white/10 border-b border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="text-white font-bold text-sm tracking-wider">CONTEXT-AWARE WORKSPACE</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-md">AI Mentor: Online</span>
                                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-md">Mode: Brainstorming</span>
                            </div>
                        </div>

                        {/* 2. Main AR Card */}
                        <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] p-10 max-w-5xl w-full shadow-2xl border border-white/60 relative overflow-hidden flex gap-10">
                            
                            {/* Animated Scanning Bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-[scan_3s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>

                            {/* Left: 3D Visualization Placeholder */}
                            <div className="w-1/3 aspect-square bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 flex items-center justify-center relative shadow-inner">
                                {/* Simulated 3D Concept Model */}
                                <div className="w-32 h-32 bg-white/50 backdrop-blur-md rounded-xl shadow-xl animate-[spin_10s_linear_infinite] flex items-center justify-center border border-white/80">
                                    <span className="text-4xl">💡</span>
                                </div>
                                <div className="absolute bottom-4 text-xs font-bold text-indigo-400 uppercase tracking-widest">Visualizing Concept...</div>
                                
                                {/* Floating "Sticky Notes" Simulation */}
                                <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-200 rounded shadow-md rotate-12 flex items-center justify-center text-[8px]">Note</div>
                                <div className="absolute bottom-10 left-4 w-8 h-8 bg-pink-200 rounded shadow-md -rotate-6 flex items-center justify-center text-[8px]">Idea</div>
                            </div>

                            {/* Right: Context & Data */}
                            <div className="flex-1 flex flex-col justify-center">
                                <h2 className="text-4xl font-black text-indigo-900 mb-2">{arView.title}</h2>
                                <p className="text-gray-500 font-medium mb-6 text-sm">{arView.description}</p>

                                {/* Live Context Sensors (The "Smart" part) */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {/* Lighting Sensor */}
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-bold text-indigo-400 uppercase">Lighting Sensor</p>
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-lg font-bold text-indigo-800">Dim (20%)</span>
                                        </div>
                                        <p className="text-[10px] text-indigo-600 mt-1 italic">"Brightness Increased for visibility"</p>
                                    </div>

                                    {/* Acoustic Sensor */}
                                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-bold text-purple-400 uppercase">Acoustic Sensor</p>
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-lg font-bold text-purple-800">Quiet</span>
                                        </div>
                                        <p className="text-[10px] text-purple-600 mt-1 italic">"Voice Commands Enabled"</p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-4 mt-auto">
                                    <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                                        + Place 3D Sticky Note
                                    </button>
                                    <button className="flex-1 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-xl font-bold hover:bg-indigo-50 transition">
                                        Import 3D Asset
                                    </button>
                                    <button 
                                        onClick={() => setArView(null)}
                                        className="px-6 py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition"
                                    >
                                        Exit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. System Messages */}
                        <div className="mt-8 flex gap-4">
                            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm font-bold border border-white/10 flex items-center gap-2">
                                🤖 AI Mentor: "I've summarized the last team meeting note."
                            </div>
                        </div>
                    </div>
                )}

                {/* 📝 CREATE / EDIT MODAL */}
                {showModal && (
                    <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white p-8 rounded-[2.5rem] max-w-lg w-full shadow-2xl relative border-4 border-white/50">
                            <h2 className="text-3xl font-black text-indigo-900 mb-6 text-center">{editingId ? 'Refine Vision' : 'Launch New Idea'}</h2>
                            <form onSubmit={handleSaveIdea} className="space-y-4">
                                <input className="w-full p-4 bg-indigo-50/50 border rounded-2xl outline-none font-bold" placeholder="Title" value={idea.title} onChange={e => setIdea({...idea, title: e.target.value})} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="p-4 bg-indigo-50/50 border rounded-2xl outline-none font-bold appearance-none" value={idea.category} onChange={e => setIdea({...idea, category: e.target.value})}>
                                        <option>Tech</option><option>Art</option><option>Business</option><option>Social</option><option>Health</option>
                                    </select>
                                    <input type="number" className="p-4 bg-indigo-50/50 border rounded-2xl outline-none font-bold" placeholder="Funding Goal ($)" value={idea.funding_goal} onChange={e => setIdea({...idea, funding_goal: e.target.value})} required />
                                </div>
                                <input className="w-full p-4 bg-indigo-50/50 border rounded-2xl outline-none font-bold" placeholder="Hashtags" value={idea.hashtags} onChange={e => setIdea({...idea, hashtags: e.target.value})} />
                                <textarea className="w-full p-4 bg-indigo-50/50 border rounded-2xl outline-none h-32 font-medium" placeholder="Description" value={idea.description} onChange={e => setIdea({...idea, description: e.target.value})} required />
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-xs">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-bold shadow-lg">Launch</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 💬 VIEW FEEDBACK MODAL */}
                {viewingFeedback && (
                    <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl relative border-4 border-white/50 flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/30 rounded-t-[2.5rem]">
                                <div><h2 className="text-xl font-black text-indigo-900">Community Voices</h2></div>
                                <button onClick={() => setViewingFeedback(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">✕</button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-4">
                                {(!reviewsData[viewingFeedback] || reviewsData[viewingFeedback].length === 0) ? (
                                    <div className="text-center py-10 opacity-50"><p className="font-bold text-gray-400">No feedback yet.</p></div>
                                ) : (
                                    reviewsData[viewingFeedback].map((rev, i) => (
                                        <div key={i} className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">U</div>
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex-1">
                                                <div className="flex justify-between"><span className="text-xs font-bold">User Review</span><span className="text-xs text-yellow-500">{renderStars(rev.rating)}</span></div>
                                                <p className="text-sm text-gray-600">{rev.comment_text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    ); 
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Dashboard />);