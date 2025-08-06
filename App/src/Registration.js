import { useState } from "react";
import axios from "axios";
import "./AuthStyles.css"; 

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setMessage({ type: "", text: "" });
    
    if (!username.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Username and password are required" });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting registration with:", { 
        username: username.trim(),
        passwordLength: password.length,
        confirmPasswordLength: confirmPassword.length
      });
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, { 
        username: username.trim(), 
        password: password.trim() 
      });
      
      console.log("Registration response:", res.data);
      setMessage({ type: "success", text: res.data.message });
      
      if (res.data.success) {
        setTimeout(() => {
          window.location.href = "/tasks";
        }, 1500);
      }
    } catch (error) {
      console.error("Registration error full details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request
      });
      
      if (error.response) {
        const errorMessage = error.response.data?.error || 
                           error.response.data?.message || 
                           "Server error: " + error.response.status;
        setMessage({ type: "error", text: errorMessage });
        console.log("Server error details:", error.response.data);
      } else if (error.request) {
        setMessage({ type: "error", text: "Cannot connect to server. Please check your connection." });
        console.log("No response received:", error.request);
      } else {
        setMessage({ type: "error", text: "Registration failed. Please try again." });
        console.log("Unexpected error:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us today and get started</p>
        </div>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-container">
              <i className="input-icon user-icon"></i>
              <input
                type="text"
                id="username"
                placeholder="Choose a username"
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-container">
              <i className="input-icon password-icon"></i>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <a href="/">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;