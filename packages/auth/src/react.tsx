'use client';

import {
  AuthProvider as Sa2kitAuthProvider,
  useAuthContext,
} from 'sa2kit/common/auth/react';
import {
  AuthGuard,
  ForgotPasswordModal,
  LoginModal,
  RegisterModal,
  UserMenu,
} from 'sa2kit/common/auth/components';
import { authClient } from './client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <Sa2kitAuthProvider authClient={authClient}>{children}</Sa2kitAuthProvider>;
}

export {
  useAuthContext,
  AuthGuard,
  LoginModal,
  RegisterModal,
  ForgotPasswordModal,
  UserMenu,
};

type LoginRegisterModalsProps = {
  loginOpen: boolean;
  registerOpen: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onSuccess?: () => void;
};

export function LoginRegisterModals({
  loginOpen,
  registerOpen,
  onCloseLogin,
  onCloseRegister,
  onOpenLogin,
  onOpenRegister,
  onSuccess,
}: LoginRegisterModalsProps) {
  return (
    <>
      <LoginModal
        isOpen={loginOpen}
        onClose={onCloseLogin}
        onSuccess={onSuccess}
        onSwitchToRegister={() => {
          onCloseLogin();
          onOpenRegister();
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={onCloseRegister}
        onSuccess={onSuccess}
        onSwitchToLogin={() => {
          onCloseRegister();
          onOpenLogin();
        }}
      />
    </>
  );
}
