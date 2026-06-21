// 🛡️ Error Boundary to catch any unexpected crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-900 text-white p-4">
          <div className="glass-panel p-10 rounded-3xl text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-white/70 mb-6">We're sorry, but something unexpected happened on the platform.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-white text-indigo-600 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 🚀 Main Landing Page Component
function App() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Note: Ensure Header, Hero, Features, etc., 
          are defined in your other files or globally 
      */}
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);