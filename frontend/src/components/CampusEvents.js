import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export default function CampusEvents({ session, profile, theme, onBack }) {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'mine' | 'rsvpd'

  const cssVars = {
    '--uni-primary': theme.primary,
    '--uni-secondary': theme.secondary,
    '--uni-badge-bg': theme.badgeBg,
    '--uni-badge-color': theme.badgeColor,
  };

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [evRes, rsvpRes] = await Promise.all([
      supabase.from('events').select('*')
        .eq('university_id', profile.university_id)
        .order('event_date', { ascending: true }),
      supabase.from('event_rsvps').select('event_id')
        .eq('user_id', session.user.id),
    ]);
    if (!evRes.error) setEvents(evRes.data || []);
    if (!rsvpRes.error) setRsvps(new Set(rsvpRes.data.map(r => r.event_id)));
    setLoading(false);
  }

  async function toggleRsvp(eventId) {
    if (rsvps.has(eventId)) {
      await supabase.from('event_rsvps').delete()
        .eq('event_id', eventId).eq('user_id', session.user.id);
      setRsvps(prev => { const s = new Set(prev); s.delete(eventId); return s; });
    } else {
      await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: session.user.id });
      setRsvps(prev => new Set([...prev, eventId]));
    }
  }

  async function deleteEvent(id) {
    await supabase.from('events').delete().eq('id', id);
    fetchAll();
  }

  const filtered = useMemo(() => {
    let out = [...events];
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(e => e.title.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q));
    }
    if (filter === 'mine') out = out.filter(e => e.creator_id === session.user.id);
    if (filter === 'rsvpd') out = out.filter(e => rsvps.has(e.id));
    return out;
  }, [events, search, filter, rsvps]);

  const upcoming = filtered.filter(e => new Date(e.event_date) >= new Date());
  const past = filtered.filter(e => new Date(e.event_date) < new Date());

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
              <h1 className="mkt-title">Campus Events</h1>
              <p className="mkt-subtitle">{theme.name} · Verified students only</p>
            </div>
          </div>
          <button className="mkt-post-btn" onClick={() => setShowPost(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post Event
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
            <input className="mkt-search" placeholder="Search events..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ '--focus': theme.primary }} />
          </div>
          <div className="mkt-filters">
            {['all','mine','rsvpd'].map(f => (
              <button key={f} className={`evt-filter-btn ${filter === f ? 'evt-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
                style={filter === f ? { background: theme.primary, color: 'white', borderColor: theme.primary } : {}}>
                {f === 'all' ? 'All Events' : f === 'mine' ? 'My Events' : 'RSVP\'d'}
              </button>
            ))}
          </div>
        </div>
        <div className="mkt-stats">
          <span>{upcoming.length} upcoming · {past.length} past</span>
        </div>
      </div>

      {/* Content */}
      <div className="mkt-content">
        {loading ? (
          <div className="mkt-empty"><div className="spinner" style={{ borderTopColor: theme.primary }} /></div>
        ) : filtered.length === 0 ? (
          <div className="mkt-empty">
            <div className="mkt-empty-icon">🎉</div>
            <h3>No events found</h3>
            <p>Be the first to post a campus event!</p>
            <button className="btn-submit" style={{ background: theme.gradient, width: 'auto', padding: '10px 24px' }} onClick={() => setShowPost(true)}>
              Post an Event
            </button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <div className="dash-section-label" style={{ marginBottom: 16 }}>Upcoming</div>
                <div className="events-grid">
                  {upcoming.map(event => (
                    <EventCard key={event.id} event={event} session={session} theme={theme}
                      rsvpd={rsvps.has(event.id)} onRsvp={toggleRsvp} onDelete={deleteEvent} />
                  ))}
                </div>
              </>
            )}
            {past.length > 0 && (
              <>
                <div className="dash-section-label" style={{ margin: '28px 0 16px' }}>Past Events</div>
                <div className="events-grid">
                  {past.map(event => (
                    <EventCard key={event.id} event={event} session={session} theme={theme}
                      rsvpd={rsvps.has(event.id)} onRsvp={toggleRsvp} onDelete={deleteEvent} past />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showPost && (
        <PostEventModal session={session} profile={profile} theme={theme}
          onClose={() => setShowPost(false)}
          onPosted={() => { setShowPost(false); fetchAll(); }} />
      )}
    </div>
  );
}

/* ─── Event Card ─── */
function EventCard({ event, session, theme, rsvpd, onRsvp, onDelete, past }) {
  const isOwner = event.creator_id === session.user.id;
  const date = new Date(event.event_date);
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={`event-card ${past ? 'event-card--past' : ''}`}>
      <div className="event-date-strip" style={{ background: past ? '#e5e7eb' : theme.gradient }}>
        <span className="event-date-month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
        <span className="event-date-day">{date.getDate()}</span>
      </div>
      <div className="event-body">
        <div className="event-meta-row">
          <span className="event-time" style={{ color: past ? '#9ca3af' : theme.primary }}>
            {dateStr} · {timeStr}
          </span>
          {isOwner && <span className="listing-owner-tag" style={{ position: 'static', fontSize: 10 }}>Your event</span>}
        </div>
        <h3 className="event-title">{event.title}</h3>
        {event.description && <p className="event-desc">{event.description}</p>}
        {event.location && (
          <div className="event-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {event.location}
          </div>
        )}
        <div className="event-actions">
          {!past && !isOwner &&  (
            <button className="event-rsvp-btn"
              onClick={() => onRsvp(event.id)}
              style={rsvpd
                ? { background: theme.badgeBg, color: theme.primary, borderColor: theme.primary }
                : { background: theme.gradient, color: 'white', borderColor: 'transparent' }}>
              {rsvpd ? '✓ Going' : 'RSVP'}
            </button>
          )}
          {isOwner && (
            <button className="listing-btn listing-btn--delete" style={{ flex: 'none', padding: '7px 16px' }}
              onClick={() => onDelete(event.id)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Post Event Modal ─── */
function PostEventModal({ session, profile, theme, onClose, onPosted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const event_date = new Date(`${date}T${time}`).toISOString();
    const { error } = await supabase.from('events').insert({
      creator_id: session.user.id,
      university_id: profile.university_id,
      title, description, location, event_date,
    });
    setLoading(false);
    if (error) setError(error.message);
    else onPosted();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ '--uni-primary': theme.primary, '--uni-badge-bg': theme.badgeBg, maxWidth: '500px' }}>
        <div className="modal-accent" style={{ background: theme.gradient }} />
        <div className="modal-body">
          <div className="modal-header">
            <div>
              <h3 className="modal-title">Post an Event</h3>
              <p className="modal-subtitle" style={{ color: theme.primary }}>{theme.name}</p>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input className="form-input" placeholder="e.g. Study Social at Johnson Center"
                value={title} onChange={e => setTitle(e.target.value)} required
                style={{ '--focus': theme.primary }} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date"
                  value={date} onChange={e => setDate(e.target.value)} required
                  style={{ '--focus': theme.primary }} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="form-input" type="time"
                  value={time} onChange={e => setTime(e.target.value)} required
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
              <label className="form-label">Description <span className="form-optional">(optional)</span></label>
              <textarea className="form-input form-textarea" placeholder="What's happening?"
                value={description} onChange={e => setDescription(e.target.value)}
                style={{ '--focus': theme.primary }} />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={loading}
                style={{ background: theme.gradient, width: 'auto', padding: '11px 28px' }}>
                {loading ? 'Posting...' : 'Post Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
