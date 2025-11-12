import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: any, info: any) {
    console.error('ErrorBoundary caught an error:', err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] grid place-items-center p-8 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-white/70">Please refresh the page. If the issue continues, try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
