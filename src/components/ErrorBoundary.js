// src/components/ErrorBoundary.js
import React from 'react';
import { Alert, Button, Container } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong.</Alert.Heading>
            <p>
              An unexpected error occurred. Please try again.
            </p>
            <hr />
            <Button variant="primary" onClick={this.handleRetry}>
              Retry
            </Button>
          </Alert>
        </Container>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
