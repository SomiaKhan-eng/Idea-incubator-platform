const API_BASE_URL = "http://localhost:8081";
const user = JSON.parse(localStorage.getItem('user') || '{}');

// ✨ 1. Reusable Status Modal (Replaces browser alert())
function StatusModal({ isOpen, type, message, onClose }) {
    if (!isOpen) return null;
    const isSuccess = type === 'success';
    
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-indigo-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center border-4 border-white/50 relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {isSuccess ? '🎉' : '⚠️'}
                </div>
                <h3 className={`text-xl font-black mb-2 ${isSuccess ? 'text-indigo-900' : 'text-red-600'}`}>
                    {isSuccess ? 'Success!' : 'Error'}
                </h3>
                <p className="text-gray-500 font-medium mb-6 text-sm">{message}</p>
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

function Marketplace() {
    const [sortBy, setSortBy] = React.useState('Popularity');
    const [ideas, setIdeas] = React.useState([]);
    
    // ✨ Modal States
    const [feedbackModal, setFeedbackModal] = React.useState({ isOpen: false, ideaId: null, ideaTitle: '' });
    
    // Investment Modal State (Replaces prompt())
    const [investModal, setInvestModal] = React.useState({ isOpen: false, ideaId: null });
    const [investAmount, setInvestAmount] = React.useState('');

    // Status Modal State (Replaces alert())
    const [statusModal, setStatusModal] = React.useState({ isOpen: false, type: 'success', message: '' });

    const [review, setReview] = React.useState({ rating: 5, text: '' });

    // Fetch ideas
    const fetchIdeas = () => {
        fetch(`${API_BASE_URL}/ideas`)
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) setIdeas(data);
            })
            .catch(err => console.error("Fetch error:", err));
    };

    React.useEffect(() => {
        fetchIdeas();
    }, []);

    // --- HANDLERS ---

    // 1. Open Feedback
    const openFeedbackModal = (item) => {
        setFeedbackModal({ isOpen: true, ideaId: item.idea_id, ideaTitle: item.title });
        setReview({ rating: 5, text: '' }); 
    };

    // 2. Open Investment
    const openInvestModal = (ideaId) => {
        setInvestModal({ isOpen: true, ideaId: ideaId });
        setInvestAmount('');
    };

    // 3. Submit Investment (No more prompt!)
    const handleInvestSubmit = async (e) => {
        e.preventDefault();
        if (!investAmount || isNaN(investAmount) || Number(investAmount) <= 0) {
            setStatusModal({ isOpen: true, type: 'error', message: "Please enter a valid amount!" });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/invest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea_id: investModal.ideaId, amount: parseFloat(investAmount) })
            });

            if (response.ok) {
                setInvestModal({ isOpen: false, ideaId: null }); // Close input modal
                setStatusModal({ isOpen: true, type: 'success', message: "Investment Successful! Funds transferred. 💸" });
                fetchIdeas(); 
            }
        } catch (err) { console.log(err); }
    };

    // 4. Submit Feedback (No more alert!)
    const submitFeedback = async (e) => {
        e.preventDefault();
        const payload = {
            idea_id: feedbackModal.ideaId,
            user_id: user.user_id,
            comment_text: review.text,
            rating: review.rating
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/post-feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setFeedbackModal({ ...feedbackModal, isOpen: false }); // Close form
                setStatusModal({ isOpen: true, type: 'success', message: "Rating submitted successfully!" });
                fetchIdeas(); 
            }
        } catch (error) {
            setStatusModal({ isOpen: true, type: 'error', message: "Could not post feedback." });
        }
    };

    // Derived Popularity Logic
    const sortedIdeas = React.useMemo(() => {
        return [...ideas].sort((a, b) => {
            if (sortBy === 'Popularity') {
                const goalA = Number(a.funding_goal) || 1; 
                const goalB = Number(b.funding_goal) || 1;
                const scoreA = (Number(a.feedback_count) || 0) + ((Number(a.current_funding) / goalA) * 10);
                const scoreB = (Number(b.feedback_count) || 0) + ((Number(b.current_funding) / goalB) * 10);
                return scoreB - scoreA;
            }
            return new Date(b.created_at) - new Date(a.created_at);
        });
    }, [ideas, sortBy]);

    const getCategoryColor = (cat) => {
        const colors = { 'Tech': 'bg-blue-500/20 text-blue-800', 'Art': 'bg-pink-500/20 text-pink-800', 'Business': 'bg-emerald-500/20 text-emerald-800', 'Social': 'bg-purple-500/20 text-purple-800', 'Health': 'bg-red-500/20 text-red-800' };
        return colors[cat] || 'bg-gray-200 text-gray-700';
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Status Modal Component Instance */}
            <StatusModal 
                isOpen={statusModal.isOpen} 
                type={statusModal.type} 
                message={statusModal.message} 
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })} 
            />

            {/* Sidebar */}
            <aside className="w-64 glass-sidebar hidden md:flex flex-col p-6 z-10 bg-white/30 backdrop-blur-lg border-r">
                <div className="text-3xl font-bold mb-10 text-indigo-600 tracking-tight italic">IdeaSpark</div>
                <nav className="space-y-3 flex-1">
                    <button onClick={() => window.location.href='dashboard.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all">My Ideas</button>
                    <button onClick={() => window.location.href='ai-mentor.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all">AI Mentor</button>
                    <button onClick={() => window.location.href='team.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all">Team Formation</button>
                    <button onClick={() => window.location.href='analytics.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all">Growth Analytics</button>
                    <button className="w-full text-left py-3 px-5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg">Marketplace</button>
                </nav>
                <div className="mt-auto pt-6 border-t border-gray-200/50">
                    <p className="text-[10px] font-bold text-indigo-600 mb-2 px-2 uppercase tracking-widest">{user.role}</p>
                    <button onClick={() => { localStorage.removeItem('user'); window.location.href='login.html'; }} className="w-full py-3 px-5 text-red-500 hover:bg-red-50 rounded-xl font-bold text-left text-sm transition-all">Log Out</button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-white drop-shadow-md">Investor Ecosystem</h1>
                        <p className="text-white/80 font-light mt-1">Explore high-potential startup ideas</p>
                    </div>
                    <div className="glass-panel p-2 rounded-xl border border-white/50">
                        <select 
                            className="bg-transparent text-sm font-bold text-indigo-900 outline-none cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="Popularity">🔥 Most Popular</option>
                            <option value="Newest">🕒 Newest First</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedIdeas.map((item) => (
                        <div key={item.idea_id} className="glass-panel p-6 rounded-2xl flex flex-col shadow-xl transition-all hover:scale-[1.02] bg-white/70">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${getCategoryColor(item.category)}`}>{item.category}</span>
                                    {Number(item.feedback_count) > 2 && (
                                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700 uppercase border border-orange-200">Trending</span>
                                    )}
                                </div>
                                <button onClick={() => openFeedbackModal(item)} className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg transition">
                                    Rate Idea
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-xs mb-4 line-clamp-3">{item.description}</p>
                            
                            <div className="flex flex-wrap gap-1 mb-6">
                                {item.tags && item.tags.split(',').map(tag => (
                                    <span key={tag} className="text-[9px] text-gray-400 italic">#{tag.trim()}</span>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end">
                                <div>
                                    <span className="text-[9px] text-gray-400 uppercase font-bold block">Goal</span>
                                    <span className="text-sm font-bold text-gray-700">${Number(item.funding_goal).toLocaleString()}</span>
                                </div>
                                
                                {user.role === 'Investor' ? (
                                    <button onClick={() => openInvestModal(item.idea_id)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition shadow-md active:scale-95">
                                        Invest Now
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-indigo-500 font-bold italic">Creator View</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ✨ FEEDBACK MODAL */}
                {feedbackModal.isOpen && (
                    <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl relative border-4 border-white/50 animate-fade-in-up">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-indigo-900">Rate this Idea</h2>
                                <p className="text-indigo-500 text-sm font-bold mt-1">{feedbackModal.ideaTitle}</p>
                            </div>
                            
                            <form onSubmit={submitFeedback} className="space-y-4">
                                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Rating</label>
                                    <select className="w-full p-2 bg-white rounded-xl font-bold text-indigo-600 outline-none border border-indigo-200" value={review.rating} onChange={e => setReview({...review, rating: e.target.value})}>
                                        <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                                        <option value="4">⭐⭐⭐⭐ (Good)</option>
                                        <option value="3">⭐⭐⭐ (Average)</option>
                                        <option value="2">⭐⭐ (Poor)</option>
                                        <option value="1">⭐ (Terrible)</option>
                                    </select>
                                </div>
                                <textarea className="w-full p-4 bg-indigo-50/50 border rounded-2xl outline-none h-32 font-medium text-sm focus:ring-2 focus:ring-indigo-400" placeholder="Share your thoughts..." value={review.text} onChange={e => setReview({...review, text: e.target.value})} required />
                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })} className="flex-1 py-3 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all">Submit Feedback</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ✨ INVESTMENT MODAL (Replaces prompt) */}
                {investModal.isOpen && (
                    <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl relative border-4 border-white/50 animate-fade-in-up">
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-2">💸</div>
                                <h2 className="text-2xl font-black text-emerald-900">Make an Investment</h2>
                                <p className="text-emerald-600/70 text-xs font-bold uppercase tracking-widest mt-1">Secure Transaction</p>
                            </div>
                            
                            <form onSubmit={handleInvestSubmit} className="space-y-4">
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <label className="text-xs font-bold text-emerald-600 uppercase block mb-2">Investment Amount ($)</label>
                                    <input 
                                        type="number" 
                                        autoFocus
                                        className="w-full p-2 bg-white rounded-xl font-black text-2xl text-emerald-800 outline-none border border-emerald-200 text-center" 
                                        placeholder="0.00" 
                                        value={investAmount} 
                                        onChange={e => setInvestAmount(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button type="button" onClick={() => setInvestModal({ isOpen: false, ideaId: null })} className="flex-1 py-3 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all">Confirm</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Marketplace />);