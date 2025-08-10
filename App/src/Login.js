import { useState } from "react";
import axios from "axios";
import "./AuthStyles.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Add validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { username }); // Debug log
      
    await axios.post("http://44.213.115.181:5050/api/login", {
     username,
     password,
  });
      console.log("Login response:", res.data); // Debug log

      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        // Also store username if needed
        localStorage.setItem("username", res.data.username);
        
        // Use React Router navigation instead of window.location if possible
        // For now, keeping your existing redirect approach
        window.location.href = "/tasks";
      } else {
        setError("Login failed. Invalid response from server.");
      }
    } catch (error) {
      console.error("Login error:", error); // Debug log
      
      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || 
                           error.response.data?.message || 
                           `Server error: ${error.response.status}`;
        setError(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        setError("Cannot connect to server. Please check your connection.");
      } else {
        // Something else happened
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-container">
              <i className="input-icon user-icon"></i>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <i className="input-icon password-icon"></i>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <a href="/registration">Create one now</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;