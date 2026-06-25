import { supabase } from '../supabaseClient';

export default function Header({ theme, toggleTheme, session }) {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="header">
      <a href="/" className="logo">Symbiosys AI Knowledge Base<span>°</span></a>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {session ? (
          <button onClick={handleLogout} className="resource-action-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Logout</button>
        ) : (
          <button onClick={handleLogin} className="resource-action-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Login</button>
        )}
        <button
          className="theme-toggle"
          id="theme-toggle"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          <svg
            className="icon-sun"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
          <svg
            className="icon-moon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
