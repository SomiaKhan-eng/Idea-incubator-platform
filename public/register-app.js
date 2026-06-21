const API_BASE_URL = "http://localhost:8081";

// --- 1. Custom Modal Component (Same as Login) ---
function FeedbackModal({ isOpen, type, message, onClose }) {
    if (!isOpen) return null;

    const isSuccess = type === 'success';
    const title = isSuccess ? 'Success!' : 'Ooops!';
    
    // Icons
    const icon = isSuccess ? (
        <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ) : (
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    );

    const buttonGradient = isSuccess ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
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

// --- 2. Main Register Form ---
function RegisterForm() {
    const [formData, setFormData] = React.useState({
        username: '',
        email: '',
        password: '',
        role: 'Creator',
        skills: '',
        bio: ''
    });

    // Modal State
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Show Green Modal -> Redirect to Login on close
                setModal({
                    isOpen: true,
                    type: 'success',
                    message: 'Account Created Successfully! Ready to log in?',
                    onClose: () => { window.location.href = 'login.html'; }
                });
            } else {
                // Error: Show Red Modal -> Stay on page
                setModal({
                    isOpen: true,
                    type: 'error',
                    message: 'Registration failed: ' + (data.message || 'Unknown error'),
                    onClose: null
                });
            }

        } catch (error) {
            console.error('Error:', error);
            // Network Error
            setModal({
                isOpen: true,
                type: 'error',
                message: 'Server connection failed! Is your backend deployed?',
                onClose: null
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            
            {/* Feedback Modal Instance */}
            <FeedbackModal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                message={modal.message} 
                onClose={closeModal} 
            />

            <div className="glass-panel p-10 rounded-3xl shadow-2xl max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-indigo-900 mb-2">Join IdeaSpark</h1>
                    <p className="text-gray-600">Start your innovation journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Full Name</label>
                        <input 
                            type="text" required
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email</label>
                            <input 
                                type="email" required
                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Password</label>
                            <input 
                                type="password" required
                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Professional Skills (Comma Separated)</label>
                        <input 
                            type="text"
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="UI Design, AR, Java, Python"
                            value={formData.skills}
                            onChange={(e) => setFormData({...formData, skills: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Short Bio</label>
                        <textarea 
                            className="w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20 resize-none text-sm"
                            placeholder="A brief introduction about your expertise..."
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">I am a...</label>
                        <select 
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="Creator">Creator (I have ideas)</option>
                            <option value="Collaborator">Collaborator (I want to help)</option>
                            <option value="Investor">Investor (I fund ideas)</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all">
                        Create Account
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account? <a href="login.html" className="text-indigo-600 font-bold hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RegisterForm />);