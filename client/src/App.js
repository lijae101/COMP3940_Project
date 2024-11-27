import React from 'react';
import './App.css';
import { useAuth } from 'react-oidc-context';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function Home() {
  const auth = useAuth();

  const signoutRedirect = () => {
    const clientId = "3hrro1o4857isbr4epti1s7nfi"; // Your Cognito client ID
    const logoutUri = "http://localhost:3000/logout"; // Your logout URL
    const cognitoDomain = "https://us-west-2paw8u2saq.auth.us-west-2.amazoncognito.com"; // Your Cognito domain

    // Clear session and local storage to ensure the user is logged out
    sessionStorage.clear();
    localStorage.clear();

    // Redirect to Cognito logout URL
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    window.location.href = logoutUrl;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  // If user is authenticated, show logged-in state
  if (auth.isAuthenticated) {
    const userName = auth.user?.profile.name || "User";
    return (
      <div className="App">
        <header className="App-header">
          <h1>Welcome, {userName}!</h1>
          <button onClick={signoutRedirect}>Sign out</button>
        </header>
      </div>
    );
  }

  // If user is not authenticated, show logged-out state
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My App</h1>
        <p>Please log in to continue.</p>
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
      </header>
    </div>
  );
}

function Logout() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>You have been logged out.</h1>
        <a href="/">Return to Home</a>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
