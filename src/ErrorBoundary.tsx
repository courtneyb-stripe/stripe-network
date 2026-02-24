import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null; componentStack: string | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? null })
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            maxWidth: 640,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            margin: 24,
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Something went wrong</h2>
          <pre style={{ margin: '0 0 12px', fontSize: 12, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
          </pre>
          {this.state.componentStack && (
            <>
              <strong style={{ fontSize: 12 }}>Component stack:</strong>
              <pre style={{ margin: '4px 0 0', fontSize: 11, overflow: 'auto', whiteSpace: 'pre-wrap', color: '#666' }}>
                {this.state.componentStack}
              </pre>
            </>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
