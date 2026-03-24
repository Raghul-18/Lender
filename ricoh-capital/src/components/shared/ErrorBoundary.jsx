import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)',
          padding: '2.5rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.75rem',
          }}>
            ⚠️
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            An unexpected error occurred. Our team has been notified. You can try
            going back to the home page.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              textAlign: 'left',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '0.75rem',
              fontSize: '0.75rem',
              color: '#991b1b',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
}
