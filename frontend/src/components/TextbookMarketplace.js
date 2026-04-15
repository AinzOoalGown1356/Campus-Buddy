import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const CONDITION_COLOR = {
  'New':      { bg: '#dcfce7', color: '#166534' },
  'Like New': { bg: '#dbeafe', color: '#1e40af' },
  'Good':     { bg: '#fef9c3', color: '#854d0e' },
  'Fair':     { bg: '#ffedd5', color: '#9a3412' },
  'Poor':     { bg: '#fee2e2', color: '#991b1b' },
};

export default function TextbookMarketplace({ session, profile, theme, onBack }) {
  const [listings, setListings]       = useState([]);
  const [soldListings, setSoldListings] = useState([]);
  const [activeTab, setActiveTab]     = useState('available');
  const [loading, setLoading]         = useState(true);
  const [showPost, setShowPost]       = useState(false);
  const [search, setSearch]           = useState('');
  const [filterCond, setFilterCond]   = useState('All');
  const [sortBy, setSortBy]           = useState('newest');
  const [contactListing, setContactListing] = useState(null);
  const [copiedId, setCopiedId]       = useState(null);

  const cssVars = {
    '--uni-primary':    theme.primary,
    '--uni-secondary':  theme.secondary,
    '--uni-badge-bg':   theme.badgeBg,
    '--uni-badge-color':theme.badgeColor,
  };

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    setLoading(true);
    const [avail, sold] = await Promise.all([
      supabase.from('textbook_listings').select('*')
        .eq('university_id', profile.university_id).eq('sold', false)
        .order('created_at', { ascending: false }),
      supabase.from('textbook_listings').select('*')
        .eq('university_id', profile.university_id).eq('sold', true)
        .order('created_at', { ascending: false }),
    ]);
    if (!avail.error) setListings(avail.data || []);
    if (!sold.error) setSoldListings(sold.data || []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let out = activeTab === 'available' ? [...listings] : [...soldListings];
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.course.toLowerCase().includes(q)
      );
    }
    if (filterCond !== 'All') out = out.filter(l => l.condition === filterCond);
    if (sortBy === 'price-asc')  out.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') out.sort((a, b) => b.price - a.price);
    return out;
    }, [listings, soldListings, activeTab, search, filterCond, sortBy]);


  async function markSold(id) {
    await supabase.from('textbook_listings').update({ sold: true }).eq('id', id);
    fetchListings();
  }

  async function deleteListing(id) {
    await supabase.from('textbook_listings').delete().eq('id', id);
    fetchListings();
  }

  function copyEmail(email, id) {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

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
              <h1 className="mkt-title">Textbook Marketplace</h1>
              <p className="mkt-subtitle">{theme.name} · Verified students only</p>
            </div>
          </div>
          <button className="mkt-post-btn" onClick={() => setShowPost(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post Listing
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mkt-tabs">
        <button className={`mkt-tab ${activeTab === 'available' ? 'mkt-tab--active' : ''}`}
          onClick={() => setActiveTab('available')}
          style={activeTab === 'available' ? { color: theme.primary, borderBottomColor: theme.primary } : {}}>
          Available <span className="mkt-tab-count">{listings.length}</span>
        </button>
        <button className={`mkt-tab ${activeTab === 'sold' ? 'mkt-tab--active' : ''}`}
          onClick={() => setActiveTab('sold')}
          style={activeTab === 'sold' ? { color: theme.primary, borderBottomColor: theme.primary } : {}}>
          Sold <span className="mkt-tab-count">{soldListings.length}</span>
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mkt-controls">
        <div className="mkt-controls-inner">
          <div className="mkt-search-wrap">
            <svg className="mkt-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="mkt-search"
              placeholder="Search by title or course..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ '--focus': theme.primary }}
            />
          </div>

          <div className="mkt-filters">
            <select className="mkt-select" value={filterCond} onChange={e => setFilterCond(e.target.value)} style={{ '--focus': theme.primary }}>
              <option value="All">All Conditions</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="mkt-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ '--focus': theme.primary }}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        <div className="mkt-stats">
          <span>{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</span>
          {search && <span className="mkt-clear" onClick={() => setSearch('')}>Clear search ✕</span>}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="mkt-content">
        {loading ? (
          <div className="mkt-empty">
            <div className="spinner" style={{ borderTopColor: theme.primary }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mkt-empty">
            <div className="mkt-empty-icon">📚</div>
            <h3>No listings found</h3>
            <p>{search ? 'Try a different search term' : 'Be the first to post a textbook!'}</p>
            <button className="btn-submit" style={{ background: theme.gradient, width: 'auto', padding: '10px 24px' }} onClick={() => setShowPost(true)}>
              Post a Listing
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {filtered.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                session={session}
                theme={theme}
                copiedId={copiedId}
                onContact={() => setContactListing(listing)}
                onCopyEmail={copyEmail}
                onMarkSold={markSold}
                onDelete={deleteListing}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showPost && (
        <PostModal
          session={session}
          profile={profile}
          theme={theme}
          onClose={() => setShowPost(false)}
          onPosted={() => { setShowPost(false); fetchListings(); }}
        />
      )}

      {/* Contact Modal */}
      {contactListing && (
        <ContactModal
          listing={contactListing}
          theme={theme}
          copiedId={copiedId}
          onCopy={copyEmail}
          onClose={() => setContactListing(null)}
        />
      )}
    </div>
  );
}

function ListingCard({ listing, session, theme, copiedId, onContact, onCopyEmail, onMarkSold, onDelete }) {
  const isOwner = listing.seller_id === session.user.id;
  const cond = CONDITION_COLOR[listing.condition] || {};
  const sellerName = listing.seller_email?.split('@')[0] || 'Student';
  const sellerInitial = sellerName[0]?.toUpperCase();

  return (
    <div className="listing-card">
      <div className="listing-img-wrap">
        {listing.image_url
          ? <img src={listing.image_url} alt={listing.title} className="listing-img" />
          : (
            <div className="listing-img-placeholder" style={{ background: theme.badgeBg }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
          )
        }
        {!listing.sold && (
          <span className="listing-condition-badge" style={{ background: cond.bg, color: cond.color }}>
            {listing.condition}
          </span>
        )}
        {listing.sold && (
          <div className="listing-sold-overlay">SOLD</div>
        )}
        {isOwner && <span className="listing-owner-tag">Your listing</span>}
      </div>

      <div className="listing-body">
        <div className="listing-course" style={{ color: theme.primary }}>{listing.course}</div>
        <h3 className="listing-title">{listing.title}</h3>
        {listing.description && <p className="listing-desc">{listing.description}</p>}

        <div className="listing-footer">
          <span className="listing-price" style={{ color: theme.primary }}>${Number(listing.price).toFixed(2)}</span>
          <div className="listing-seller">
            {listing.profiles?.avatar_url
              ? <img src={listing.profiles.avatar_url} alt={sellerName} className="listing-seller-avatar" />
              : <div className="listing-seller-avatar listing-seller-initials" style={{ background: theme.gradient }}>{sellerInitial}</div>
            }
            <span>{sellerName}</span>
          </div>
        </div>

        <div className="listing-actions">
          {isOwner ? (
            <>
              {!listing.sold && (
                <button className="listing-btn listing-btn--sold" onClick={() => onMarkSold(listing.id)}
                  style={{ borderColor: theme.primary, color: theme.primary }}>
                  Mark Sold
                </button>
              )}
              <button className="listing-btn listing-btn--delete" onClick={() => onDelete(listing.id)}>
                Delete
              </button>
            </>
          ) : (
            <button className="listing-btn listing-btn--contact" onClick={onContact}
              style={{ background: theme.gradient }}>
              Contact Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Post Modal ─── */
function PostModal({ session, profile, theme, onClose, onPosted }) {
  const [title, setTitle]       = useState('');
  const [course, setCourse]     = useState('');
  const [price, setPrice]       = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);

    let image_url = null;

    if (photo) {
      const fileExt = photo.name.split('.').pop();
      const filePath = `${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage
        .from('textbook-images').upload(filePath, photo, { upsert: true });
      if (upErr) { setError('Image upload failed: ' + upErr.message); setLoading(false); return; }
      const { data } = supabase.storage.from('textbook-images').getPublicUrl(filePath);
      image_url = data.publicUrl;
    }

    const { error } = await supabase.from('textbook_listings').insert({
      seller_id:     session.user.id,
      university_id: profile.university_id,
      title,
      course,
      price:         parseFloat(price),
      condition,
      description,
      image_url,
      seller_email:  session.user.email,
    });

    setLoading(false);
    if (error) setError(error.message);
    else onPosted();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{
        '--uni-primary': theme.primary,
        '--uni-badge-bg': theme.badgeBg,
        maxWidth: '520px',
      }}>
        <div className="modal-accent" style={{ background: theme.gradient }} />
        <div className="modal-body">
          <div className="modal-header">
            <div>
              <h3 className="modal-title">Post a Textbook</h3>
              <p className="modal-subtitle" style={{ color: theme.primary }}>{theme.name}</p>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input className="form-input" placeholder="e.g. Calculus: Early Transcendentals"
                  value={title} onChange={e => setTitle(e.target.value)} required
                  style={{ '--focus': theme.primary }} />
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <input className="form-input" placeholder="e.g. MATH 113"
                  value={course} onChange={e => setCourse(e.target.value)} required
                  style={{ '--focus': theme.primary }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="25.00"
                  value={price} onChange={e => setPrice(e.target.value)} required
                  style={{ '--focus': theme.primary }} />
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-input" value={condition} onChange={e => setCondition(e.target.value)} required
                  style={{ '--focus': theme.primary }}>
                  <option value="">Select condition</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description <span className="form-optional">(optional)</span></label>
              <textarea className="form-input form-textarea" placeholder="Edition, ISBN, any notes..."
                value={description} onChange={e => setDescription(e.target.value)}
                style={{ '--focus': theme.primary }} />
            </div>

            <div className="form-group">
              <label className="form-label">Photo <span className="form-optional">(optional)</span></label>
              <label className="photo-upload-btn" style={{ borderColor: `${theme.primary}55`, color: theme.primary }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {photo ? photo.name : 'Upload photo'}
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
              {photoPreview && <img src={photoPreview} alt="preview" className="photo-preview" />}
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={loading}
                style={{ background: theme.gradient, width: 'auto', padding: '11px 28px' }}>
                {loading ? 'Posting...' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Contact Modal ─── */
function ContactModal({ listing, theme, copiedId, onCopy, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ '--uni-primary': theme.primary, maxWidth: '400px' }}>
        <div className="modal-accent" style={{ background: theme.gradient }} />
        <div className="modal-body">
          <div className="modal-header">
            <h3 className="modal-title">Contact Seller</h3>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="contact-book">
            <div className="contact-book-icon" style={{ background: theme.badgeBg }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div>
              <p className="contact-book-title">{listing.title}</p>
              <p className="contact-book-course" style={{ color: theme.primary }}>{listing.course} · ${Number(listing.price).toFixed(2)}</p>
            </div>
          </div>

          <p className="contact-hint">Reach out to the seller directly via their university email:</p>

          <div className="contact-email-row">
            <span className="contact-email">{listing.seller_email}</span>
            <button
              className="contact-copy-btn"
              style={{ background: theme.badgeBg, color: theme.primary }}
              onClick={() => onCopy(listing.seller_email, listing.id)}
            >
              {copiedId === listing.id ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <a
            href={`mailto:${listing.seller_email}?subject=Interested in: ${encodeURIComponent(listing.title)}&body=Hi, I saw your listing for ${encodeURIComponent(listing.title)} on Campus Buddy. Is it still available?`}
            className="btn-submit"
            style={{ background: theme.gradient, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '12px' }}
          >
            Open in Email App
          </a>
        </div>
      </div>
    </div>
  );
}