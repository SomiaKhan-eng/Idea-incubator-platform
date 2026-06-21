const API_BASE_URL = "http://localhost:8081";

function AIMentor() {
    const [messages, setMessages] = React.useState([
        { role: 'ai', text: 'Hello! I am your IdeaSpark AI Mentor. Ask me anything about your project or investment strategy!' }
    ]);
    const [input, setInput] = React.useState('');

    // Get user for sidebar
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const response = await fetch(`${API_BASE_URL}/ask-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Is the server running?' }]);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            
            {/* GLASS SIDEBAR (Fixed & Consistent) */}
            <aside className="w-64 glass-sidebar hidden md:flex flex-col p-6 z-10 bg-white/30 backdrop-blur-lg border-r h-full">
                
                <div className="text-3xl font-bold mb-10 text-indigo-600 tracking-tight italic">IdeaSpark</div>
                
                <nav className="space-y-3 flex-1 overflow-y-auto">
                    <button onClick={() => window.location.href='dashboard.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        My Ideas
                    </button>
                    
                    {/* Active State */}
                    <button onClick={() => window.location.href='ai-mentor.html'} className="w-full text-left py-3 px-5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg transition-all glass-button">
                        AI Mentor
                    </button>
                    
                    <button onClick={() => window.location.href='team.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        Team Formation
                    </button>
                    
                    <button onClick={() => window.location.href='analytics.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        Growth Analytics
                    </button>

                    <button onClick={() => window.location.href='marketplace.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        Marketplace
                    </button>
                </nav>

                {/* LOG OUT SECTION (Pinned to Bottom) */}
                <div className="mt-auto pt-6 border-t border-gray-200/50">
                    <p className="text-[10px] font-bold text-indigo-600 mb-2 px-2 uppercase tracking-widest">{user.role || 'User'}</p>
                    <button 
                        onClick={() => window.location.href='logout.html'} 
                        className="w-full py-3 px-5 text-red-500 hover:bg-red-50 rounded-xl font-bold text-left text-sm transition-all"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Chat Interface */}
            <main className="flex-1 p-8 flex flex-col relative z-0">
                <h1 className="text-4xl font-bold text-white mb-6 drop-shadow-md">AI Mentor</h1>
                
                <div className="flex-1 glass-panel rounded-3xl p-6 overflow-y-auto mb-4 space-y-4 shadow-xl bg-white/70 backdrop-blur-md">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white/90 text-gray-800 rounded-bl-none border border-white/50'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="glass-panel p-4 rounded-2xl flex gap-4 shadow-lg bg-white/80 backdrop-blur-md">
                    <input 
                        className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 font-medium"
                        placeholder="Type your question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-md">
                        Send
                    </button>
                </div>
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AIMentor />);