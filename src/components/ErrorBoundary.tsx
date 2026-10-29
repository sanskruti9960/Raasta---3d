import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Raasta-3D ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#ffffff',
          border: '1px solid #dadce0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
          borderRadius: 16,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          maxWidth: '90vw'
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#fce8e6',
            color: '#d93025',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>
              Interface recovered safely
            </div>
            <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>
              An interaction error was caught and prevented the screen from turning blank.
            </div>
          </div>
          <button
            onClick={this.handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#1a73e8',
              color: '#ffffff',
              border: 'none',
              borderRadius: 9999,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} />
            <span>Resume</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
