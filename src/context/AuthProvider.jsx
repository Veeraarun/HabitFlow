import { useState, useEffect, useCallback, useRef } from "react";
import { AuthContext } from "./AuthContext";
import { supabase, isSupabaseConfigured } from "../services/supabase";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to restore session:", error);
        setAuthError("Failed to restore session.");
        setIsLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setAuthError(null);
      },
    );

    subscriptionRef.current = subscription;

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError("Cloud sign-in is not configured.");
      return;
    }

    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setAuthError(
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google.",
      );
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError("Cloud sign-in is not configured.");
      return;
    }

    setAuthError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
      setAuthError(
        error instanceof Error ? error.message : "Failed to sign out.",
      );
    }
  }, []);

  const value = {
    user,
    isLoading,
    authError,
    isSupabaseConfigured,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
