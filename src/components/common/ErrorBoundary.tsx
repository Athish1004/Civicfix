import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    try {
      window.location.reload();
    } catch (e) {
      // ignore
    }
  };

  private handleRecover = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-amber-200 shadow-xl max-w-md w-full p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">
                {this.props.fallbackTitle || 'Navigation Restored'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A component encountered a temporary view glitch. Your data is safe. Click below to continue using CivicFix.
              </p>
            </div>

            {this.state.error && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-600 truncate text-left">
                {this.state.error.message || 'Render exception handled.'}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleRecover}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resume App</span>
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
              >
                Reload View
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
