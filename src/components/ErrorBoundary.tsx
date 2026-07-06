import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCcw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error captured by boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6 text-slate-200 font-sans relative overflow-hidden">
          {/* Neon background light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
          
          <div className="max-w-md w-full bg-[#0F172A]/80 border border-white/5 p-8 rounded-2xl shadow-2xl relative text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/5 animate-pulse">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-red-400 font-bold px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                System Interruption
              </span>
              <h2 className="font-display text-2xl font-black text-white tracking-tight pt-2">
                Viewport Rendering Failed
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                An unexpected runtime error has occurred inside our reactive viewport. Our system logs have registered this event.
              </p>
              {this.state.error && (
                <div className="mt-4 p-3 bg-slate-950 border border-white/5 rounded-xl text-left">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Error Signature:</p>
                  <p className="text-[10px] font-mono text-cyan-400/90 mt-1 break-all overflow-auto max-h-20 leading-relaxed">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-cyan-500/10"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-950/60 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
