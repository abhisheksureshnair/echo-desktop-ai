import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { login as apiLogin, registraction as apiRegistraction } from '../api/authApi';

const getErrorMessage = (err) => {
  if (err.response) {
    return err.response.data?.message || err.response.data?.error || `Server Error (${err.response.status})`;
  } else if (err.request) {
    return 'Unable to connect to backend server. Please verify it is running on port 8080.';
  } else {
    return err.message || 'An unexpected error occurred.';
  }
};

export default function AuthScreen({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration Form State (Aligned with Backend/Mongoose Model)
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Username
  const [loginPassword, setLoginPassword] = useState('');

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!fullname.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRegistraction({
        fullname,
        username,
        email,
        password
      });
      
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Auto-toggle to login on successful registration
      setIsRegister(false);
      setLoginIdentifier(email);
      setLoginPassword(password);
      alert('Registration Successful! You can now log in.');
    } catch (err) {
      console.error('Registration error:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please fill in all credentials.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiLogin({
        username: loginIdentifier,
        password: loginPassword
      });

      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || 'Login failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Skip Login/Guest Mode to easily bypass during design/dev
  const handleBypass = () => {
    onLoginSuccess('bypass-token', {
      fullname: 'Guest User',
      username: 'guest',
      email: 'guest@echo.ai'
    });
  };

  return (
    <div style={styles.container}>
      {/* Draggable Title Bar (Required for Electron Frameless App) */}
      <div style={styles.draggableHeader}>
        <div style={styles.dragDotGroup}>
          <span style={styles.dragDot} />
          <span style={styles.dragDot} />
          <span style={styles.dragDot} />
        </div>
        <span style={styles.dragTitle}>ECHO AUTHENTICATION</span>
      </div>

      <div style={styles.formWrapper}>
        {/* Animated Accent Glow Block */}
        <div style={styles.glowOverlay} />

        {/* Logo and Greeting */}
        <div style={styles.logoContainer}>
          <div style={styles.logoIconBg}>
            <Sparkles size={24} style={styles.logoIcon} />
          </div>
          <h2 style={styles.brandTitle}>ECHO</h2>
          <p style={styles.brandSubtitle}>
            {isRegister ? 'Create an account to start your co-pilot journey' : 'Sign in to access your intelligent assistant'}
          </p>
        </div>

        {/* Dynamic Panel (Register / Login Switch) */}
        <form 
          style={styles.form} 
          onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit}
        >
          {error && (
            <div style={styles.errorAlert}>
              <span>{error}</span>
            </div>
          )}

          {isRegister ? (
            /* REGISTRATION FIELDS */
            <div style={styles.fieldsContainer}>
              <div style={styles.inputWrapper}>
                <User size={16} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type="text" 
                  placeholder="Full Name"
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div style={styles.inputWrapper}>
                <User size={16} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type="text" 
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password (Min. 6 characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ) : (
            /* LOGIN FIELDS */
            <div style={styles.fieldsContainer}>
              <div style={styles.inputWrapper}>
                <Mail size={16} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type="text" 
                  placeholder="Email or Username"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div style={styles.inputWrapper}>
                <Lock size={16} style={styles.inputIcon} />
                <input 
                  style={styles.input} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button 
            type="submit" 
            style={isLoading ? styles.submitBtnLoading : styles.submitBtn}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Processing…' : isRegister ? 'Create Account' : 'Sign In'}</span>
            {!isLoading && <ArrowRight size={16} style={styles.btnArrow} />}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div style={styles.toggleFooter}>
          <span style={styles.toggleText}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            type="button" 
            style={styles.toggleBtn}
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            disabled={isLoading}
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OR CHOOSE</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Bypass Button */}
        <button 
          type="button" 
          onClick={handleBypass}
          style={styles.bypassBtn}
          title="Directly enter Echo without signing in"
        >
          <ShieldCheck size={14} style={{ marginRight: 6 }} />
          <span>Skip Login & Continue</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#070C15',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 20px rgba(91, 140, 255, 0.1)',
  },
  draggableHeader: {
    height: '36px',
    backgroundColor: '#0B1220',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    WebkitAppRegion: 'drag',
    userSelect: 'none',
  },
  dragDotGroup: {
    display: 'flex',
    gap: '6px',
  },
  dragDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dragTitle: {
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  formWrapper: {
    flex: 1,
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  },
  glowOverlay: {
    position: 'absolute',
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '280px',
    height: '180px',
    backgroundColor: '#5B8CFF',
    borderRadius: '50%',
    filter: 'blur(90px)',
    opacity: 0.18,
    pointerEvents: 'none',
    zIndex: 0,
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '28px',
    zIndex: 1,
  },
  logoIconBg: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(91, 140, 255, 0.2) 0%, rgba(91, 140, 255, 0.05) 100%)',
    border: '1.5px solid rgba(91, 140, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    boxShadow: '0 8px 24px rgba(91, 140, 255, 0.2)',
  },
  logoIcon: {
    color: '#5B8CFF',
  },
  brandTitle: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-display)',
    background: 'linear-gradient(135deg, #FFFFFF 30%, #5B8CFF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '6px',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#7E8799',
    maxWidth: '300px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    zIndex: 1,
  },
  errorAlert: {
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    color: '#FCA5A5',
    fontSize: '11px',
    fontWeight: '500',
    textAlign: 'center',
  },
  fieldsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    WebkitAppRegion: 'no-drag',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    height: '42px',
    padding: '0 16px 0 42px',
    backgroundColor: 'rgba(20, 26, 40, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s ease',
    WebkitAppRegion: 'no-drag',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitAppRegion: 'no-drag',
  },
  submitBtn: {
    height: '42px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #5B8CFF 0%, #3B72F1 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.25s ease',
    boxShadow: '0 6px 20px rgba(91, 140, 255, 0.25)',
    WebkitAppRegion: 'no-drag',
  },
  submitBtnLoading: {
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(20, 26, 40, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitAppRegion: 'no-drag',
  },
  btnArrow: {
    transition: 'transform 0.2s ease',
  },
  toggleFooter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '16px',
    fontSize: '12px',
    zIndex: 1,
  },
  toggleText: {
    color: '#7E8799',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#5B8CFF',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '2px 4px',
    outline: 'none',
    WebkitAppRegion: 'no-drag',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0 10px 0',
    opacity: 0.35,
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: '8px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: '#7E8799',
    padding: '0 10px',
  },
  bypassBtn: {
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#B8C0D4',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    WebkitAppRegion: 'no-drag',
  }
};
