import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: false }; // Don't show error UI, just suppress the error
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress useInsertionEffect warnings
    if (error.message.includes('useInsertionEffect') || error.message.includes('schedule updates')) {
      console.warn('Suppressed useInsertionEffect error:', error.message);
      return;
    }
    
    // Log other errors but don't crash the app
    console.warn('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return children instead of error UI to keep the app running
      return <View style={{ flex: 1 }}>{this.props.children}</View>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 