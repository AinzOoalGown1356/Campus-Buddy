import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { getThemeFromDomain } from '../universityThemes';

const MAJORS = [
  'Computer Science', 'Information Technology', 'Cybersecurity',
  'Biology', 'Chemistry', 'Psychology', 'Business Administration',
  'Accounting', 'Finance', 'Mechanical Engineering', 'Civil Engineering',
  'Electrical Engineering', 'Mathematics', 'English', 'History',
  'Political Science', 'Nursing', 'Education', 'Communications', 'Other'
];

export default function ProfileSetup({ session, onComplete }) {
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const domain = session.user.user_metadata?.domain || session.user.email.split('@')[1];
  const theme = getThemeFromDomain(domain);
  const university = theme.name;

  const cssVars = {
    '--uni-primary': theme.primary,
    '--uni-secondary': theme.secondary,
    '--uni-accent': theme.accent,
    '--uni-badge-bg': theme.badgeBg,
    '--uni-badge-color': theme.badgeColor,
  };

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);

    let avatar_url = null;

    if (photo) {
      const fileExt = photo.name.split('.').pop();
      const filePath = `${session.user.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(filePath, photo, { upsert: true });
      if (uploadError) { setError('Photo upload failed: ' + uploadError.message); setLoading(false); return; }
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatar_url = data.publicUrl;
    }

    const { data: uniData } = await supabase
      .from('universities').select('id').eq('email_domain', domain).single();

    if (!uniData) { setError('University not found'); setLoading(false); return; }

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      email: session.user.email,
      name: fullName,
      major, year,
      university_id: uniData.id,
      avatar_url
    });

    setLoading(false);
    if (error) setError(error.message);
    else onComplete();
  }

  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const step = !fullName ? 1 : !major ? 2 : !year ? 3 : 4;

  return (
    <div className="setup-root" style={cssVars}>
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-bg-image" style={{ backgroundImage: `url(${theme.campusImage})` }} />
        <div className="auth-bg-overlay" style={{ background: theme.heroGradient }} />
      </div>

      <div className="setup-container">
        {/* Header */}
        <div className="setup-header">
          <div className="setup-uni-badge" style={{ background: theme.badgeBg, color: theme.badgeColor, borderColor: `${theme.badgeColor}44` }}>
            {theme.short}
          </div>
          <h1 className="setup-title">Set up your profile</h1>
          <p className="setup-sub">{university}</p>
        </div>

        {/* Progress */}
        <div className="setup-progress">
          {[1,2,3,4].map(s => (
            <div key={s} className="setup-progress-item">
              <div
                className={`setup-progress-dot ${s <= step ? 'active' : ''}`}
                style={s <= step ? { background: theme.primary } : {}}
              />
              {s < 4 && <div className={`setup-progress-line ${s < step ? 'active' : ''}`} style={s < step ? { background: theme.primary } : {}} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="setup-card">
          <div className="setup-card-accent" style={{ background: theme.gradient }} />

          {/* Avatar preview */}
          <div className="setup-avatar-preview">
            {photoPreview
              ? <img src={photoPreview} alt="preview" className="setup-avatar-img" style={{ borderColor: theme.primary }} />
              : (
                <div className="setup-avatar-placeholder" style={{ background: theme.gradient }}>
                  {initials}
                </div>
              )
            }
          </div>

          <form onSubmit={handleSubmit} className="setup-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                style={{ '--focus': theme.primary }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Major</label>
              <select
                className="form-input"
                value={major}
                onChange={e => setMajor(e.target.value)}
                required
                style={{ '--focus': theme.primary }}
              >
                <option value="">Select your major</option>
                {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-input"
                value={year}
                onChange={e => setYear(e.target.value)}
                required
                style={{ '--focus': theme.primary }}
              >
                <option value="">Select your year</option>
                {['Freshman','Sophomore','Junior','Senior','Graduate'].map(y =>
                  <option key={y} value={y}>{y}</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Photo <span className="form-optional">(optional)</span></label>
              <label className="photo-upload-btn" style={{ borderColor: `${theme.primary}55`, color: theme.primary }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {photo ? photo.name : 'Upload a photo'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{ background: theme.gradient }}
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
