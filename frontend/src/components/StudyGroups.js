import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export default function StudyGroups({ session, profile, theme, onBack }) {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState(new Set()); // group_ids user has joined
  const [memberCounts, setMemberCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'mine' | 'joined'

  const cssVars = {
    '--uni-primary': theme.primary,
    '--uni-secondary': theme.secondary,
    '--uni-badge-bg': theme.badgeBg,
    '--uni-badge-color': theme.badgeColor,
  };

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [grpRes, memRes, countRes] = await Promise.all([
      supabase.from('study_groups').select('*')
        .eq('university_id', profile.university_id)
        .order('created_at', { ascending: false }),
      supabase.from('study_group_members').select('group_id')
        .eq('user_id', session.user.id),
      supabase.from('study_group_members').select('group_id'),
    ]);
    if (!grpRes.error) setGroups(grpRes.data || []);
    if (!memRes.error) setMembers(new Set(memRes.data.map(m => m.group_id)));
    if (!countRes.error) {
      const counts = {};
      countRes.data.forEach(m => { counts[m.group_id] = (counts[m.group_id] || 0) + 1; });
      setMemberCounts(counts);
    }
    setLoading(false);
  }

  async function toggleJoin(group) {
    const joined = members.has(group.id);
    if (joined) {
      await supabase.from('study_group_members').delete()
        .eq('group_id', group.id).eq('user_id', session.user.id);
      setMembers(prev => { const s = new Set(prev); s.delete(group.id); return s; });
      setMemberCounts(prev => ({ ...prev, [group.id]: (prev[group.id] || 1) - 1 }));
    } else {
      const count = memberCounts[group.id] || 0;
      if (count >= group.max_members) return;
      await supabase.from('study_group_members').insert({ group_id: group.id, user_id: session.user.id });
      setMembers(prev => new Set([...prev, group.id]));
      setMemberCounts(prev => ({ ...prev, [group.id]: (prev[group.id] || 0) + 1 }));
    }
  }

  async function deleteGroup(id) {
    await supabase.from('study_group_members').delete().eq('group_id', id);
    await supabase.from('study_groups').delete().eq('id', id);
    fetchAll();
  }

  const filtered = useMemo(() => {
    let out = [...groups];
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(g =>
        g.course_code.toLowerCase().includes(q) ||
        g.course_name?.toLowerCase().includes(q) ||
        g.location?.toLowerCase().includes(q)
      );
    }
    if (filter === 'mine') out = out.filter(g => g.creator_id === session.user.id);
    if (filter === 'joined') out = out.filter(g => members.has(g.id));
    return out;
  }, [groups, search, filter, members]);

  return (
    <div className="marketplace" style={cssVars}>
      {/* Header */}
      <div className="mkt-header" style={{ background: theme.gradient }}>
        <div className="mkt-header-inner">
          <div className="mkt-header-left">
            <button className="mkt-back-btn" onClick={onBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Dashboard
            </button>
            <div>
              <h1 className="mkt-title">Study Groups</h1>
              <p className="mkt-subtitle">{theme.name} · Verified students only</p>
            </div>
          </div>
          <button className="mkt-post-btn" onClick={() => setShowPost(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Group
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mkt-controls">
        <div className="mkt-controls-inner">
          <div className="mkt-search-wrap">
            <svg className="mkt-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="mkt-search" placeholder="Search by course code or name..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ '--focus': theme.primary }} />
          </div>
          <div className="mkt-filters">
            {['all', 'mine', 'joined'].map(f => (
              <button key={f}
                className={`evt-filter-btn ${filter === f ? 'evt-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
                style={filter === f ? { background: theme.primary, color: 'white', borderColor: theme.primary } : {}}>
                {f === 'all' ? 'All Groups' : f === 'mine' ? 'My Groups' : 'Joined'}
              </button>
            ))}
          </div>
        </div>
        <div className="mkt-stats">
          <span>{filtered.length} group{filtered.length !== 1 ? 's' : ''}</span>
          {search && <span className="mkt-clear" onClick={() => setSearch('')}>Clear ✕</span>}
        </div>
      </div>

      {/* Content */}
      <div className="mkt-content">
        {loading ? (
          <div className="mkt-empty"><div className="spinner" style={{ borderTopColor: theme.primary }} /></div>
        ) : filtered.length === 0 ? (
          <div className="mkt-empty">
            <div className="mkt-empty-icon">📖</div>
            <h3>No study groups found</h3>
            <p>{search ? 'Try a different search.' : 'Create the first one for your course!'}</p>
            <button className="btn-submit"
              style={{ background: theme.gradient, width: 'auto', padding: '10px 24px' }}
              onClick={() => setShowPost(true)}>
              Create a Group
            </button>
          </div>
        ) : (
          <div className="sg-grid">
            {filtered.map(group => (
              <StudyGroupCard
                key={group.id}
                group={group}
                session={session}
                theme={theme}
                joined={members.has(group.id)}
                memberCount={memberCounts[group.id] || 0}
                onToggle={toggleJoin}
                onDelete={deleteGroup}
              />
            ))}
          </div>
        )}
      </div>

      {showPost && (
        <CreateGroupModal
          session={session}
          profile={profile}
          theme={theme}
          onClose={() => setShowPost(false)}
          onCreated={() => { setShowPost(false); fetchAll(); }}
        />
      )}
    </div>
  );
}

/* ─── Study Group Card ─── */
function StudyGroupCard({ group, session, theme, joined, memberCount, onToggle, onDelete }) {
  const isOwner = group.creator_id === session.user.id;
  const isFull = memberCount >= group.max_members;
  const meetingDate = group.meeting_time ? new Date(group.meeting_time) : null;
  const pct = Math.round((memberCount / group.max_members) * 100);

  return (
    <div className="sg-card">
      {/* Course badge strip */}
      <div className="sg-card-top" style={{ background: theme.gradient }}>
        <div className="sg-course-code">{group.course_code}</div>
        {isOwner && <span className="sg-owner-tag">Your group</span>}
      </div>

      <div className="sg-card-body">
        {group.course_name && <p className="sg-course-name">{group.course_name}</p>}

        <div className="sg-details">
          {meetingDate && (
            <div className="sg-detail-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{meetingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {meetingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
          )}
          {group.location && (
            <div className="sg-detail-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{group.location}</span>
            </div>
          )}
        </div>

        {/* Member progress bar */}
        <div className="sg-members">
          <div className="sg-members-label">
            <span>{memberCount} / {group.max_members} members</span>
            {isFull && <span className="sg-full-badge">Full</span>}
          </div>
          <div className="sg-progress-bar">
            <div className="sg-progress-fill"
              style={{ width: `${pct}%`, background: isFull ? '#dc2626' : theme.primary }} />
          </div>
        </div>

        {/* Actions */}
        <div className="sg-actions">
          {!isOwner && (
            <button
              className="sg-join-btn"
              onClick={() => onToggle(group)}
              disabled={isFull && !joined}
              style={joined
                ? { background: theme.badgeBg, color: theme.primary, borderColor: theme.primary }
                : isFull
                  ? { background: '#f3f4f6', color: '#9ca3af', borderColor: '#e5e7eb', cursor: 'not-allowed' }
                  : { background: theme.gradient, color: 'white', borderColor: 'transparent' }
              }>
              {joined ? '✓ Joined' : isFull ? 'Full' : 'Join Group'}
            </button>
          )}
          {isOwner && (
            <button className="listing-btn listing-btn--delete" onClick={() => onDelete(group.id)}>
              Delete Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Create Group Modal ─── */
function CreateGroupModal({ session, profile, theme, onClose, onCreated }) {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);

    const meeting_time = date && time ? new Date(`${date}T${time}`).toISOString() : null;

    const { error } = await supabase.from('study_groups').insert({
      creator_id: session.user.id,
      university_id: profile.university_id,
      course_code: courseCode.toUpperCase(),
      course_name: courseName,
      location,
      meeting_time,
      max_members: parseInt(maxMembers),
    });

    setLoading(false);
    if (error) setError(error.message);
    else onCreated();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ '--uni-primary': theme.primary, '--uni-badge-bg': theme.badgeBg, maxWidth: '500px' }}>
        <div className="modal-accent" style={{ background: theme.gradient }} />
        <div className="modal-body">
          <div className="modal-header">
            <div>
              <h3 className="modal-title">Create Study Group</h3>
              <p className="modal-subtitle" style={{ color: theme.primary }}>{theme.name}</p>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input className="form-input" placeholder="e.g. CS 321"
                  value={courseCode} onChange={e => setCourseCode(e.target.value)} required
                  style={{ '--focus': theme.primary }} />
              </div>
              <div className="form-group">
                <label className="form-label">Course Name <span className="form-optional">(optional)</span></label>
                <input className="form-input" placeholder="e.g. Data Structures"
                  value={courseName} onChange={e => setCourseName(e.target.value)}
                  style={{ '--focus': theme.primary }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Meeting Date <span className="form-optional">(optional)</span></label>
                <input className="form-input" type="date"
                  value={date} onChange={e => setDate(e.target.value)}
                  style={{ '--focus': theme.primary }} />
              </div>
              <div className="form-group">
                <label className="form-label">Meeting Time <span className="form-optional">(optional)</span></label>
                <input className="form-input" type="time"
                  value={time} onChange={e => setTime(e.target.value)}
                  style={{ '--focus': theme.primary }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location <span className="form-optional">(optional)</span></label>
              <input className="form-input" placeholder="e.g. Johnson Center, Room 311"
                value={location} onChange={e => setLocation(e.target.value)}
                style={{ '--focus': theme.primary }} />
            </div>

            <div className="form-group">
              <label className="form-label">Max Members</label>
              <input className="form-input" type="number" min="2" max="50"
                value={maxMembers} onChange={e => setMaxMembers(e.target.value)} required
                style={{ '--focus': theme.primary }} />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={loading}
                style={{ background: theme.gradient, width: 'auto', padding: '11px 28px' }}>
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
