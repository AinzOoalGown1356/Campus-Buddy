import { useState } from 'react';
import { supabase } from '../supabaseClient';
import ProfileEdit from './ProfileEdit';
import TextbookMarketplace from './TextbookMarketplace';
import CampusEvents from './CampusEvents';
import StudyGroups from './StudyGroups';
import { getThemeFromDomain } from '../universityThemes';

export default function Dashboard({ session, profile, onProfileUpdate }) {
  const [showEdit, setShowEdit] = useState(false);
  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard' | 'textbooks' | 'events'

  const domain = session?.user?.user_metadata?.domain || session?.user?.email?.split('@')[1];
  const theme = getThemeFromDomain(domain);

  const cssVars = {
    '--uni-primary':    theme.primary,
    '--uni-secondary':  theme.secondary,
    '--uni-accent':     theme.accent,
    '--uni-badge-bg':   theme.badgeBg,
    '--uni-badge-color':theme.badgeColor,
  };

  async function handleLogout() { await supabase.auth.signOut(); }

  if (activePage === 'events') {
    return <CampusEvents session={session} profile={profile} theme={theme} onBack={() => setActivePage('dashboard')} />;
  }

  if (activePage === 'studygroups') {
    return <StudyGroups session={session} profile={profile} theme={theme} onBack={() => setActivePage('dashboard')} />;
  }

  if (activePage === 'textbooks') {
    return <TextbookMarketplace session={session} profile={profile} theme={theme} onBack={() => setActivePage('dashboard')} />;
  }

  const displayName = profile.name || profile.full_name || 'Student';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="dashboard" style={cssVars}>
      <nav className="navbar" style={{ background: theme.gradient }}>
        <div className="nav-brand">
          <div className="nav-logomark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 8l10 5 10-5-10-5zM2 16l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="nav-appname">Campus Buddy</span>
          <div className="nav-uni-badge" style={{ background: theme.badgeBg, color: theme.badgeColor, borderColor: `${theme.badgeColor}44` }}>
            {theme.short}
          </div>
        </div>
        <div className="nav-actions">
          <button className="nav-btn-edit" onClick={() => setShowEdit(true)} style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
            Edit Profile
          </button>
          <button className="nav-btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      <div className="dash-hero" style={{ background: `${theme.primary}10` }}>
        <div className="dash-hero-inner">
          <div className="dash-avatar-wrap">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="dash-avatar" style={{ borderColor: theme.primary }} />
              : <div className="dash-avatar-placeholder" style={{ background: theme.gradient }}>{initials}</div>
            }
            <div className="dash-avatar-ring" style={{ borderColor: theme.secondary }} />
          </div>
          <div className="dash-welcome-text">
            <p className="dash-greeting">Welcome back,</p>
            <h1 className="dash-name">{displayName}</h1>
            <div className="dash-meta">
              <span className="dash-tag" style={{ background: theme.badgeBg, color: theme.primary }}>{profile.major}</span>
              <span className="dash-tag" style={{ background: theme.badgeBg, color: theme.primary }}>{profile.year}</span>
              <span className="dash-tag" style={{ background: theme.badgeBg, color: theme.primary }}>{theme.name}</span>
            </div>
            <p className="dash-email">{profile.email}</p>
          </div>
        </div>
      </div>

      <div className="dash-content">
        <div className="dash-section-label">Campus Features</div>
        <div className="features-grid">

          <div className="feature-card feature-card--live" onClick={() => setActivePage('studygroups')} style={{ cursor: 'pointer', borderColor: `${theme.primary}30` }}>
            <div className="feature-live-dot" style={{ background: theme.primary }} />
            <div className="feature-icon" style={{ background: theme.badgeBg, color: theme.primary }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <h3 className="feature-title">Study Groups</h3>
            <p className="feature-desc">Find and join course-specific study groups at {theme.name}.</p>
            <span className="feature-badge" style={{ background: theme.primary, color: 'white' }}>✓ Live — Open</span>
          </div>

          <div className="feature-card feature-card--live" onClick={() => setActivePage('textbooks')} style={{ cursor: 'pointer', borderColor: `${theme.primary}30` }}>
            <div className="feature-live-dot" style={{ background: theme.primary }} />
            <div className="feature-icon" style={{ background: theme.badgeBg, color: theme.primary }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M12 3v18"/></svg>
            </div>
            <h3 className="feature-title">Textbook Marketplace</h3>
            <p className="feature-desc">Buy and sell textbooks with verified classmates at {theme.name}.</p>
            <span className="feature-badge" style={{ background: theme.primary, color: 'white' }}>✓ Live — Open</span>
          </div>

          <div className="feature-card feature-card--live" onClick={() => setActivePage('events')} style={{ cursor: 'pointer', borderColor: `${theme.primary}30` }}>
            <div className="feature-live-dot" style={{ background: theme.primary }} />
            <div className="feature-icon" style={{ background: theme.badgeBg, color: theme.primary }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3 className="feature-title">Campus Events</h3>
            <p className="feature-desc">Discover and RSVP to events posted by verified students at your school.</p>
            <span className="feature-badge" style={{ background: theme.primary, color: 'white' }}>✓ Live — Open</span>
          </div>

        </div>
      </div>

      {showEdit && (
        <ProfileEdit session={session} profile={profile} theme={theme}
          onClose={() => setShowEdit(false)}
          onUpdate={() => { onProfileUpdate(); setShowEdit(false); }} />
      )}
    </div>
  );
}