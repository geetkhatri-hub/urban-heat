import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught react runtime error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
            <div className="inline-flex p-4 bg-red-950/50 border border-red-500/20 rounded-2xl text-red-500 mb-6">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>
            
            <h1 className="text-2xl font-semibold mb-2 font-display text-slate-100">
              Platform Error
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The UrbanHeatX AI engine encountered an unexpected rendering exception. Safe system state preserved.
            </p>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 mb-6 text-left overflow-x-auto">
                <code className="text-xs text-red-400 font-mono block whitespace-pre">
                  {this.state.error.name}: {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-xl transition duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Control Center
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
