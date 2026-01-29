import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("CRITICAL RUNTIME ERROR:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 text-center font-sans selection:bg-rose-500/30">
                    {/* Ambient Danger Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative z-10 max-w-md w-full">
                        <div className="mb-12 inline-flex items-center justify-center h-24 w-24 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] shadow-2xl shadow-rose-900/20 animate-pulse">
                            <ShieldAlert className="h-10 w-10 text-rose-500" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic leading-none">
                            Interface <br />
                            <span className="text-rose-500">Compromised</span>
                        </h1>

                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed mb-12 max-w-xs mx-auto opacity-70">
                            A recursive runtime anomaly has forced a system isolation. The current architectural state has been preserved for diagnostic review.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-2xl active:scale-95"
                            >
                                <RefreshCw className="h-4 w-4" /> Hard Reboot System
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full h-16 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                            >
                                <Home className="h-4 w-4 text-slate-500" /> Return to Genesis
                            </button>
                        </div>

                        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center">
                            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] mb-4">Error Intelligence Report</div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl w-full text-left overflow-x-auto">
                                <code className="text-[9px] text-rose-400/60 font-mono break-all leading-tight block">
                                    {this.state.error?.toString() || 'Unknown Protocol Violation'}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
