const API_BASE_URL = "http://localhost:8081";

// --- 1. Custom Modal Component ---
function FeedbackModal({ isOpen, type, message, onClose }) {
    if (!isOpen) return null;

    // Define styles based on type (Success vs Error)
    const isSuccess = type === 'success';
    const title = isSuccess ? 'Success!' : 'Ooops!';
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

// --- 2. Main Login Form ---
function LoginForm() {
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
        role: 'Creator'
    });

    // State for the modal
    const [modal, setModal] = React.useState({
        isOpen: false,
        type: 'success', // 'success' or 'error'
        message: '',
        onClose: null // Function to run when closed
    });

    const closeModal = () => {
        // If there is a specific action to take on close (like redirecting), run it
        if (modal.onClose) {
            modal.onClose();
        }
        // Reset modal state
        setModal({ ...modal, isOpen: false, onClose: null });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Attempting login with:", formData); 

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Storing the full user object
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show Success Modal -> Redirect on close
                setModal({
                    isOpen: true,
                    type: 'success',
                    message: `Welcome back! Logging you in as a ${formData.role}.`,
                    onClose: () => { window.location.href = 'dashboard.html'; }
                });

            } else {
                // Show Error Modal -> Just close on click
                setModal({
                    isOpen: true,
                    type: 'error',
                    message: data.message || 'Login failed. Please check your credentials.',
                    onClose: null 
                });
            }
        } catch (error) {
            console.error('Error:', error);
            // Show Network Error Modal
            setModal({
                isOpen: true,
                type: 'error',
                message: 'Server is not responding. Ensure the backend is running.',
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
                    <h1 className="text-4xl font-bold text-indigo-900 mb-2">Welcome</h1>
                    <p className="text-gray-600">Login to continue your journey</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Login as...</label>
                        <select 
                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.role} 
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="Creator">Creator</option>
                            <option value="Collaborator">Collaborator</option>
                            <option value="Investor">Investor</option>
                        </select>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="abc123@gmail.com" 
                            className="w-full p-3 rounded-xl border bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required 
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••" 
                            className="w-full p-3 rounded-xl border bg-white/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required 
                        />
                    </div>

                    <button type="submit" className="w-full py-3 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg transform active:scale-95 transition-all">
                        Sign In
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account? <a href="register.html" className="text-indigo-600 font-bold hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LoginForm />);