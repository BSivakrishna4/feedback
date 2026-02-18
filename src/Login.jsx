import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./services/api";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            setError("Please enter both email and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.login(email, password);
            
            if (response.success) {
                // Store full user data with password for demo purposes
                const users = JSON.parse(localStorage.getItem("users")) || [];
                const fullUser = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
                localStorage.setItem("loggedInUser", JSON.stringify(fullUser));
                navigate(fullUser.role === "admin" ? "/admin" : "/home");
            } else {
                setError(response.message);
                if (response.message === "No account found") {
                    setIsSignup(true);
                }
            }
        } catch (error) {
            setError(error.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle signup
    const handleSignup = async (e) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) {
            setError("First and last name are required");
            return;
        }
        if (!email.trim() || !password || !confirmPassword) {
            setError("Please fill all fields");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const userData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.toLowerCase().trim(),
                password
            };

            const response = await api.signup(userData);

            if (response.success) {
                setSuccessMessage(response.message);
                setTimeout(() => {
                    setIsSignup(false);
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setError("");
                    setSuccessMessage("");
                }, 2000);
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError(error.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Toggle login/signup
    const toggleMode = () => {
        setIsSignup(!isSignup);
        setError(""); setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>College Feedback System</h1>
                    <p>{isSignup ? "Create your account" : "Login to continue"}</p>
                </div>

                {!isSignup ? (
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Enter your email" 
                                disabled={loading}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Enter your password" 
                                disabled={loading}
                                required 
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        <div className="form-footer">
                            <p>Don't have an account? <span className="toggle-link" onClick={toggleMode}>Sign up here</span></p>
                        </div>
                    </form>
                ) : (
                    <form className="signup-form" onSubmit={handleSignup}>
                        <div className="form-group">
                            <label>First Name</label>
                            <input 
                                type="text" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} 
                                placeholder="Enter your first name" 
                                disabled={loading}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} 
                                placeholder="Enter your last name" 
                                disabled={loading}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Enter your email" 
                                disabled={loading}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Enter your password" 
                                minLength="6" 
                                disabled={loading}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="Confirm your password" 
                                minLength="6" 
                                disabled={loading}
                                required 
                            />
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        {successMessage && <div className="success-message">{successMessage}</div>}
                        <button type="submit" className="signup-button" disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                        <div className="form-footer">
                            <p>Already have an account? <span className="toggle-link" onClick={toggleMode}>Login here</span></p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;