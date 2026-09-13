import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import Icon from '../../components/ui/Icon';
import { forgotPasswordApi } from '../../services/api';

// The backend exposes roles student/collector/admin — preserved verbatim.
// UI presented as Citizen / Field Officer / Municipal Administrator.
const ROLE_TABS = [
  { key: 'student', label: 'Citizen', icon: 'user', desc: 'Report waste & track complaints' },
  { key: 'collector', label: 'Field Officer', icon: 'truck', desc: 'Collection operations' },
  { key: 'admin', label: 'Municipal Admin', icon: 'shield', desc: 'Control room & management' },
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState('student');
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPass, setSuPass] = useState('');
  const [suConfirm, setSuConfirm] = useState('');

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const roleTab = ROLE_TABS.find((r) => r.key === selectedRole);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role !== 'student') setActiveTab('login');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim() || !loginPass) {
      setError('Please provide your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(loginEmail.trim().toLowerCase(), loginPass, selectedRole);
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!suName || !suEmail || !suPass || !suConfirm) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(suEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (suPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (suPass !== suConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: suName, email: suEmail, password: suPass });
      showToast('Welcome! 100 points sign-up bonus credited.', 'success', 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail) {
      setForgotError('Please provide your email.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await forgotPasswordApi({ email: forgotEmail });
      setForgotSuccess(res.data.message);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Request failed. Please verify your details.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page" id="auth-root">
      {/* Left visual panel */}
      <div className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-visual-brand">
          <div className="brand-mark brand-mark-lg" aria-hidden="true">
            <Icon name="recycle" size={26} />
          </div>
          <div className="auth-visual-brand-text">
            <div className="auth-brand-name">SustainX</div>
            <div className="auth-brand-sub">Smart City Waste Intelligence</div>
          </div>
        </div>
        <div className="auth-tagline">
          One platform connecting
          <br />
          <span>citizens, bins &amp; municipal operations.</span>
        </div>
        <ul className="auth-feature-list">
          <li><Icon name="check" size={16} /> Report waste in seconds from your phone</li>
          <li><Icon name="check" size={16} /> Live smart-bin monitoring for collectors</li>
          <li><Icon name="check" size={16} /> City-wide control room for administrators</li>
        </ul>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <div className="role-selector" role="group" aria-label="Select your role">
            {ROLE_TABS.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`role-btn ${selectedRole === r.key ? 'active' : ''}`}
                onClick={() => handleRoleSelect(r.key)}
              >
                <Icon name={r.icon} size={17} />
                {r.label}
              </button>
            ))}
          </div>
          {roleTab && <p className="role-desc">{roleTab.desc}</p>}

          <div className="auth-tabs" role="tablist">
            <button className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setError(''); }}>
              Sign In
            </button>
            {selectedRole === 'student' && (
              <button className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => { setActiveTab('signup'); setError(''); }}>
                Register
              </button>
            )}
          </div>

          {activeTab === 'login' && (
            <div>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-hint">Sign in to your {roleTab?.label} account</p>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '.95rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="loginEmail">Email address</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><Icon name="user" size={16} /></span>
                    <input id="loginEmail" className="form-input" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="email" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="loginPass">Password</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><Icon name="shield" size={16} /></span>
                    <input id="loginPass" className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} autoComplete="current-password" />
                    <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility">
                      <Icon name="eye" size={16} />
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '.3rem' }}>
                    <button type="button" className="btn-link" onClick={() => { setIsForgotOpen(true); setForgotError(''); setForgotSuccess(''); }}>
                      Forgot password?
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              {selectedRole === 'student' && (
                <p className="auth-switch-text">
                  New to SustainX?{' '}
                  <button onClick={() => { setActiveTab('signup'); setError(''); }}>Create a citizen account →</button>
                </p>
              )}
              {selectedRole !== 'student' && (
                <p className="auth-switch-text" style={{ opacity: 0.7, fontSize: '.82rem' }}>
                  {selectedRole === 'collector'
                    ? 'Field officer accounts are provisioned by municipal administration.'
                    : 'Administrator accounts are provisioned by super admins.'}
                </p>
              )}
            </div>
          )}

          {activeTab === 'signup' && selectedRole === 'student' && (
            <div>
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-hint">Join SustainX as a citizen — free</p>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSignup} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="suName">Full name</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><Icon name="user" size={16} /></span>
                    <input id="suName" className="form-input" type="text" placeholder="Your full name" value={suName} onChange={(e) => setSuName(e.target.value)} autoComplete="name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="suEmail">Email address</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><Icon name="mail" size={16} /></span>
                    <input id="suEmail" className="form-input" type="email" placeholder="you@example.com" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} autoComplete="email" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="suPass">Password</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><Icon name="shield" size={16} /></span>
                    <input id="suPass" className="form-input" type="password" placeholder="Min. 6 characters" value={suPass} onChange={(e) => setSuPass(e.target.value)} autoComplete="new-password" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="suConfirm">Confirm password</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon"><Icon name="shield" size={16} /></span>
                    <input id="suConfirm" className="form-input" type="password" placeholder="Repeat password" value={suConfirm} onChange={(e) => setSuConfirm(e.target.value)} autoComplete="new-password" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <p className="auth-switch-text">
                Already registered?{' '}
                <button onClick={() => { setActiveTab('login'); setError(''); }}>Sign in →</button>
              </p>
            </div>
          )}

          <p className="auth-footer-bar">SustainX · Smart City Waste Intelligence &amp; Operations Platform</p>
        </div>
      </div>

      <Modal id="forgot-modal" isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} title="Reset Password">
        <div style={{ padding: '1.5rem' }}>
          {forgotSuccess ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ color: 'var(--clr-green)', marginBottom: '.5rem' }}>Request Sent</h3>
              <p className="text-muted" style={{ fontSize: '.9rem', lineHeight: '1.5' }}>{forgotSuccess}</p>
              <button className="btn btn-primary btn-full" style={{ marginTop: '1.5rem' }} onClick={() => setIsForgotOpen(false)}>Close</button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              <p className="text-muted" style={{ fontSize: '.85rem', marginBottom: '1.2rem' }}>
                Enter your registered email address. Reset instructions will be sent.
              </p>
              {forgotError && <div className="auth-error" style={{ marginBottom: '1rem' }}>{forgotError}</div>}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="forgotEmail">Email address</label>
                <input id="forgotEmail" className="form-input" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={forgotLoading}>
                {forgotLoading ? 'Requesting…' : 'Send Reset Instructions'}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}