const API_BASE_URL = "http://localhost:8081";

function Analytics() {
    // 🛡️ Safety: Initialize with default values
    const [stats, setStats] = React.useState({ 
        total_users: 0, 
        total_ideas: 0, 
        total_capital: 0,
        trending_idea: "Loading...",
        categories: [] 
    });

    const [loading, setLoading] = React.useState(true);

    // 🆕 State for "Live" Sensor Data Simulation
    const [sensorData, setSensorData] = React.useState({
        lighting: 88,
        noise: 45,
        status: 'Optimized'
    });

    // Get current user for the Sidebar name
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    React.useEffect(() => {
        fetch(`${API_BASE_URL}/analytics?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                setStats({
                    total_users: data.total_users || 0,
                    total_ideas: data.total_ideas || 0,
                    total_capital: data.total_capital || 0, 
                    trending_idea: data.trending_idea || "No ideas yet",
                    categories: Array.isArray(data.categories) ? data.categories : []
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching stats:", err);
                setLoading(false);
            });
    }, []);

    // 🆕 EFFECT: Simulate "Live" AR Sensor fluctuations
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSensorData(prev => ({
                lighting: Math.min(100, Math.max(70, prev.lighting + (Math.random() * 6 - 3))), // Fluctuates +/- 3%
                noise: Math.min(100, Math.max(20, prev.noise + (Math.random() * 10 - 5))),      // Fluctuates +/- 5%
                status: Math.random() > 0.7 ? 'Scanning...' : 'Optimized'
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const getColor = (cat) => {
        const colors = { 'Tech': 'bg-blue-500', 'Art': 'bg-pink-500', 'Business': 'bg-emerald-500', 'Social': 'bg-purple-500', 'Health': 'bg-red-500' };
        return colors[cat] || 'bg-indigo-500';
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-white text-2xl animate-pulse">Loading Ecosystem Data... 📡</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            
            {/* GLASS SIDEBAR */}
            <aside className="w-64 glass-sidebar hidden md:flex flex-col p-6 z-10 bg-white/30 backdrop-blur-lg border-r h-full">
                
                <div className="text-3xl font-bold mb-10 text-indigo-600 tracking-tight italic">IdeaSpark</div>
                
                <nav className="space-y-3 flex-1 overflow-y-auto">
                    <button onClick={() => window.location.href='dashboard.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        My Ideas
                    </button>
                    <button onClick={() => window.location.href='ai-mentor.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        AI Mentor
                    </button>
                    <button onClick={() => window.location.href='team.html'} className="w-full text-left py-3 px-5 text-gray-600 hover:bg-white/50 hover:text-indigo-600 rounded-xl font-medium transition-all glass-button">
                        Team Formation
                    </button>
                    
                    {/* Active State for Analytics */}
                    <button onClick={() => window.location.href='analytics.html'} className="w-full text-left py-3 px-5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg transition-all glass-button">
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

            {/* MAIN CONTENT */}
            <main className="flex-1 p-8 overflow-y-auto relative z-0">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-white drop-shadow-md">Ecosystem Analytics</h1>
                        <p className="text-white/80 text-lg mt-1 font-light">Real-time Innovation & Workspace Metrics</p>
                    </div>
                    <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-md transition border border-white/30">
                        Download Report 📥
                    </button>
                </div>

                {/* 💰 INVESTOR METRICS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-panel p-6 rounded-3xl border-t border-white/40 relative overflow-hidden group bg-white/70">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                        </div>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Total Capital Raised</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h2 className="text-3xl font-bold text-emerald-600">${Number(stats.total_capital).toLocaleString()}</h2>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-100 px-1.5 py-0.5 rounded">↑ 12%</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border-t border-white/40 shadow-inner group cursor-pointer hover:bg-white/80 transition bg-white/70">
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Trending Project</p>
                        <h2 className="text-2xl font-bold text-indigo-600 mt-1 truncate">🔥 {stats.trending_idea}</h2>
                        <p className="text-xs text-gray-400 mt-2 group-hover:text-indigo-500 transition">View Details →</p>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border-t border-white/40 bg-white/70">
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Total Ideas</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h2 className="text-3xl font-bold text-gray-800">{stats.total_ideas}</h2>
                            <span className="text-xs font-bold text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded">+3 this week</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* SECTOR GROWTH CHART */}
                    <div className="glass-panel p-8 rounded-3xl bg-white/80">
                        <h3 className="text-xl font-bold text-gray-800 mb-8">Sector Distribution</h3>
                        <div className="space-y-6">
                            {stats.categories.length > 0 ? stats.categories.map((item) => (
                                <div key={item.category} className="group">
                                    <div className="flex justify-between mb-2 items-end">
                                        <span className="font-bold text-gray-700">{item.category}</span>
                                        <span className="text-gray-500 text-xs font-mono">{item.count} Projects ({Math.round((item.count / stats.total_ideas) * 100)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-white/50 shadow-inner">
                                        <div 
                                            className={`h-full rounded-full ${getColor(item.category)} transition-all duration-1000 relative`} 
                                            style={{ width: `${stats.total_ideas > 0 ? (item.count / stats.total_ideas) * 100 : 0}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 py-10">No category data available yet.</p>
                            )}
                        </div>
                    </div>

                    {/* 🕶️ LIVE AR CONTEXT METRICS */}
                    <div className="glass-panel p-8 rounded-3xl bg-indigo-900/5 border-l-8 border-indigo-600 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                AR Workspace Live Data
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Simulated Live Metric 1 */}
                                <div className="p-4 bg-white/60 rounded-2xl shadow-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700">Ambient Lighting</span>
                                        <span className="text-xs font-mono text-gray-500">{Math.round(sensorData.lighting)}% Lux</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500 ease-out" style={{width: `${sensorData.lighting}%`}}></div>
                                    </div>
                                </div>

                                {/* Simulated Live Metric 2 */}
                                <div className="p-4 bg-white/60 rounded-2xl shadow-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700">Noise Level (ANC)</span>
                                        <span className="text-xs font-mono text-gray-500">{Math.round(sensorData.noise)} dB</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className={`${sensorData.noise > 70 ? 'bg-red-500' : 'bg-green-500'} h-2 rounded-full transition-all duration-500 ease-out`} style={{width: `${sensorData.noise}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-indigo-100/50 border border-indigo-100">
                            <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
                                <span className="font-bold">System Status:</span> {sensorData.status} <br/>
                                "High collaboration scores detected in Tech sector. Lighting automatically adjusted for focus mode."
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Analytics />);