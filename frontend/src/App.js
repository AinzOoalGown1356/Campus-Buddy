import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading Campus Buddy...</p>
    </div>
  );

  if (!session) return <Auth />;
  if (!profile || !profile.name) return <ProfileSetup session={session} onComplete={() => fetchProfile(session.user.id)} />;
  return <Dashboard session={session} profile={profile} onProfileUpdate={() => fetchProfile(session.user.id)} />;
}

export default App;
