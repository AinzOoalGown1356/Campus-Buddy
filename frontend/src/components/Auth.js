import { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { getThemeFromEmail, UNIVERSITY_THEMES } from '../universityThemes';


const TEAM_MEMBERS = ['Shayan Khan', 'Noe Flores', 'Aser Eshetu', 'MKayla Sutthiprapa', 'Enoch Ogunfiditimi'];

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = useMemo(() => getThemeFromEmail(email), [email]);
  const domain = email.includes('@') ? email.split('@')[1]?.toLowerCase() : null;
  const isValidDomain = domain && UNIVERSITY_THEMES[domain];

  async function handleSignUp(e) {
    e.preventDefault();
    setError(''); setMessage('');
    if (!isValidDomain) { setError('Please use your official university email address.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { university: theme.name, domain } }
    });
    setLoading(false);
    if (error) setError(error.message);
    else setMessage(`Check your ${theme.name} email to verify your account.`);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email first.'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setMessage('Password reset email sent!');
  }

  const cssVars = {
    '--uni-primary': theme.primary,
    '--uni-secondary': theme.secondary,
    '--uni-accent': theme.accent,
    '--uni-badge-bg': theme.badgeBg,
    '--uni-badge-color': theme.badgeColor,
  };

  return (
    <div className="auth-root" style={cssVars}>
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-bg-image" style={{ backgroundImage: `url(${theme.campusImage})` }} />
        <div className="auth-bg-overlay" style={{ background: theme.heroGradient }} />
        <div className="auth-bg-grain" />
      </div>

      {/* LEFT — branding + hero */}
<div className="auth-left">
  <div className="auth-left-top">
    <div className="auth-wordmark">
      <span className="auth-wordmark-text">Campus Buddy</span>
    </div>

          <div className="auth-hero">
            {isValidDomain ? (
              <div className="uni-pill" style={{
                background: theme.badgeBg,
                color: theme.badgeColor,
                borderColor: `${theme.badgeColor}50`,
              }}>
                <span>●</span> {theme.name}
              </div>
            ) : null}

            <h1 className="auth-headline">
              {isValidDomain
                ? <><em>Welcome</em><br />home.</>
                : <>Your campus.<br /><em>Your people.</em></>
              }
            </h1>

            <p className="auth-subline">
              {isValidDomain
                ? `Connect with verified ${theme.name} students — study groups, events, and textbooks all in one place.`
                : 'A verified college student only platform for Virginia university students. Buy textbooks, find study groups, and discover campus events.'
              }
            </p>
          </div>

          <div className="school-chips">
            {Object.values(UNIVERSITY_THEMES).map(t => (
              <div
                key={t.short}
                className={`school-chip ${isValidDomain && theme.name === t.name ? 'school-chip--active' : ''}`}
                style={isValidDomain && theme.name === t.name ? {
                  background: t.badgeBg,
                  borderColor: `${t.badgeColor}55`,
                  color: t.badgeColor,
                } : {}}
              >
                {t.short}
              </div>
            ))}
          </div>
        </div>

        {/* Team credits at bottom */}
        <div className="auth-credits">
          <p className="auth-credits-label">CS 321 | Spring 2026 | Professor Dr. David Samudio</p>
          <p className="auth-credits-label" style={{ marginTop: 6 }}>Made by</p>
          <p className="auth-credits-names">
            {TEAM_MEMBERS.map((name, i) => (
              <span key={name}>
                <strong>{name}</strong>
                {i < TEAM_MEMBERS.length - 1 ? ' | ' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="auth-right">
        <div className="auth-right-inner">
          <div className="auth-right-header">
            <h2 className="auth-right-title">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="auth-right-sub">
              {mode === 'login'
                ? 'Welcome back — use your university email.'
                : 'Join your campus community today.'}
            </p>
          </div>

          <div className="auth-mode-toggle">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                className={`auth-mode-btn ${mode === m ? 'auth-mode-btn--active' : ''}`}
                onClick={() => { setMode(m); setError(''); setMessage(''); }}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={mode === 'signup' ? handleSignUp : handleLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label">University Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@gmu.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ '--focus': theme.primary }}
              />
              {mode === 'signup' && domain && (
                <span className={`domain-hint ${isValidDomain ? 'domain-hint--valid' : 'domain-hint--invalid'}`}>
                  {isValidDomain ? `✓ ${theme.name} detected` : '✗ Unsupported university email'}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ '--focus': theme.primary }}
              />
              {mode === 'login' && (
                <button type="button" className="forgot-link"
                  onClick={handleForgotPassword}
                  style={{ color: theme.primary }}>
                  Forgot password?
                </button>
              )}
            </div>

            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}

            <button type="submit" className="btn-submit" disabled={loading}
              style={{ background: theme.gradient }}>
              {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}