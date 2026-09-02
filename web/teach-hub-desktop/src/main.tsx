import { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';

import {
  AUTH_BASE_URL,
  TEACH_HUB_API_BASE_URL,
  createTeachHubClient,
  fetchSession,
  type AuthUser,
} from './api';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import './styles.css';

function AppShell() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const sessionUser = await fetchSession();
    setUser(sessionUser);
  }, []);

  const teachHubApi = useMemo(
    () => createTeachHubClient(() => setUser(null)),
    [],
  );

  useEffect(() => {
    void (async () => {
      await refreshSession();
      setLoading(false);
    })();
  }, [refreshSession]);

  if (loading) {
    return <div className="app-main">加载中…</div>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>TeachHub Desktop</h1>
        <div>
          {user ? (
            <>
              <span className="muted" style={{ marginRight: 12 }}>
                {user.name || user.email}
              </span>
              <button className="btn-ghost" type="button" onClick={() => setUser(null)}>
                切换账号
              </button>
            </>
          ) : (
            <Link to="/login">登录</Link>
          )}
        </div>
      </header>
      <main className="app-main">
        <p className="muted">
          API: {TEACH_HUB_API_BASE_URL} · Auth: {AUTH_BASE_URL}
        </p>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage onLoggedIn={() => void refreshSession()} />}
          />
          <Route
            path="/"
            element={
              user ? (
                <HomePage api={teachHubApi} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
