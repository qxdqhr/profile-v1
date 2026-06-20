import { useEffect } from 'react';
import { AUTH_BASE_URL, fetchSession } from '../api';

type Props = {
  onLoggedIn: () => void;
};

export function LoginPage({ onLoggedIn }: Props) {
  useEffect(() => {
    const timer = setInterval(() => {
      void (async () => {
        const user = await fetchSession();
        if (user) onLoggedIn();
      })();
    }, 2000);
    return () => clearInterval(timer);
  }, [onLoggedIn]);

  return (
    <div>
      <h2>登录</h2>
      <p className="muted">在下方页面完成登录，检测到会话后自动进入首页。</p>
      <iframe className="login-frame" src={AUTH_BASE_URL} title="TeachHub Login" />
    </div>
  );
}
