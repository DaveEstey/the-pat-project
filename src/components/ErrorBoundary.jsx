import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong!
          </h2>
          <p className="text-gray-700 mb-4">
            The game encountered an error. Please refresh the page to try again.
          </p>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Refresh Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;