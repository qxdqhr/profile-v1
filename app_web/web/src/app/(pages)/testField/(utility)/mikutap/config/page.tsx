import { AuthGuard, AuthProvider } from '@/lib/auth';
import ConfigPage from '@/modules/mikutap/pages/ConfigPage';

export default function MikutapConfigRoute() {
  return (
    <AuthProvider>
      <AuthGuard requireAuth>
        <ConfigPage />
      </AuthGuard>
    </AuthProvider>
  );
}
