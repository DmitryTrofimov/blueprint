"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AuthPopup, type AuthMode } from "./auth-popup";

interface AuthModalContextValue {
  openLogin: () => void;
  openSignup: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);

  const openLogin = useCallback(() => setMode("login"), []);
  const openSignup = useCallback(() => setMode("signup"), []);
  const close = useCallback(() => setMode(null), []);

  const value = useMemo(() => ({ openLogin, openSignup }), [openLogin, openSignup]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {mode && (
        <AuthPopup
          mode={mode}
          onClose={close}
          onSwitchMode={setMode}
        />
      )}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}
