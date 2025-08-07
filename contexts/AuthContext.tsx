import React, { createContext, useContext, useState, useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import { supabase } from "../lib/supabase";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Google sign-in
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "<GOOGLE_CLIENT_ID>",
    webClientId: "<GOOGLE_WEB_CLIENT_ID>",
  });

  useEffect(() => {
    // Listen for auth state
    const session = supabase.auth.getSession();
    setUser(session?.user ?? null);
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.data?.unsubscribe();
  }, []);

  const signUpWithEmail = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: "https://your-app.com/confirm" }
    });
    setLoading(false);
    return { data, error };
  };

  const signInWithEmail = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { data, error };
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await promptAsync();
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, signUpWithEmail, signInWithEmail, signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);