import { useState } from 'react';
import { supabase } from '../supabaseClient';

const MAJORS = [
  'Computer Science', 'Information Technology', 'Cybersecurity',
  'Biology', 'Chemistry', 'Psychology', 'Business Administration',
  'Accounting', 'Finance', 'Mechanical Engineering', 'Civil Engineering',
  'Electrical Engineering', 'Mathematics', 'English', 'History',
  'Political Science', 'Nursing', 'Education', 'Communications', 'Other'
];

export default function ProfileEdit({ session, profile, theme, onClose, onUpdate }) {
  const [fullName, setFullName] = useState(profile.name || '');
  const [major, setMajor] = useState(profile.major || '');
  const [year, setYear] = useState(profile.year || '');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);

    let avatar_url = profile.avatar_url;

    if (photo) {
      const fileExt = photo.name.split('.').pop();
      const filePath = `${session.user.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(filePath, photo, { upsert: true });
      if (uploadError) { setError('Photo upload failed.'); setLoading(false); return; }
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatar_url = data.publicUrl;
    }

    const { error } = await supabase.from('profiles').update({
      name: fullName, major, year, avatar_url,
      updated_at: new Date().toISOString(),
    }).eq('id', session.user.id);

    setLoading(false);
    if (error) setError(error.message);
    else onUpdate();
  }

  const currentAvatar = photoPreview || profile.avatar_url;
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

async function handleResetPassword() {
  const newPass = prompt('Enter your new password (min 6 characters):');
  if (!newPass || newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
  const { error } = await supabase.auth.updateUser({ password: newPass });
  if (error) setError(error.message);
  else alert('Password updated successfully!');
}
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{
        '--uni-primary': theme.primary,
        '--uni-secondary': theme.secondary,
        '--uni-badge-bg': theme.badgeBg,
        '--uni-badge-color': theme.badgeColor,
      }}>
        <div className="modal-accent" style={{ background: theme.gradient }} />

        <div className="modal-body">
          <div className="modal-header">
            <div>
              <h3 className="modal-title">Edit Profile</h3>
              <p className="modal-subtitle" style={{ color: theme.primary }}>{theme.name}</p>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          {/* Avatar preview */}
          <div className="modal-avatar-wrap">
            {currentAvatar
              ? <img src={currentAvatar} alt="avatar" className="modal-avatar" style={{ borderColor: theme.primary }} />
              : <div className="modal-avatar-placeholder" style={{ background: theme.gradient }}>{initials}</div>
            }
            <label className="modal-avatar-change" style={{ background: theme.badgeBg, color: theme.primary }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Change
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={fullName}
                onChange={e => setFullName(e.target.value)} required
                style={{ '--focus': theme.primary }} />
            </div>

            <div className="form-group">
              <label className="form-label">Major</label>
              <select className="form-input" value={major}
                onChange={e => setMajor(e.target.value)} required
                style={{ '--focus': theme.primary }}>
                {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select className="form-input" value={year}
                onChange={e => setYear(e.target.value)} required
                style={{ '--focus': theme.primary }}>
                {['Freshman','Sophomore','Junior','Senior','Graduate'].map(y =>
                  <option key={y} value={y}>{y}</option>
                )}
              </select>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="button" className="btn-cancel" onClick={handleResetPassword}>
  Reset Password
</button>
              <button type="submit" className="btn-submit" disabled={loading}
                style={{ background: theme.gradient }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
