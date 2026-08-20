import { supabase, isSupabaseConfigValid } from "../lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: "customer" | "admin";
  created_at?: string;
}

export const authService = {
  async getCurrentSession() {
    if (!isSupabaseConfigValid) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getCurrentProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigValid) {
      const savedUser = localStorage.getItem("storyvault_current_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          return {
            id: parsed.id || parsed.uid || "local-patron-001",
            email: parsed.email || "patron@storyvault.com",
            full_name: parsed.displayName || parsed.name || "StoryVault Patron",
            role: "customer"
          };
        } catch (_) {}
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) return null;
      return data as UserProfile;
    } catch (_) {
      return null;
    }
  },

  async signUpWithEmail(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigValid) {
      const mockProfile: UserProfile = {
        id: `local-patron-${Date.now()}`,
        email,
        full_name: fullName,
        role: "customer"
      };
      localStorage.setItem("storyvault_current_user", JSON.stringify(mockProfile));
      return { data: { user: mockProfile, session: null }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    return { data, error };
  },

  async signInWithEmail(email: string, password: string) {
    if (!isSupabaseConfigValid) {
      const mockProfile: UserProfile = {
        id: `local-patron-001`,
        email,
        full_name: email.split("@")[0] || "StoryVault Patron",
        role: "customer"
      };
      localStorage.setItem("storyvault_current_user", JSON.stringify(mockProfile));
      return { data: { user: mockProfile, session: null }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signInWithGoogle() {
    if (!isSupabaseConfigValid) {
      const mockProfile: UserProfile = {
        id: "google-patron-001",
        email: "byron@google.org",
        full_name: "Lord Byron (Google)",
        role: "customer"
      };
      localStorage.setItem("storyvault_current_user", JSON.stringify(mockProfile));
      return { data: { provider: "google", url: null }, error: null };
    }

    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectUrl}/login`
      }
    });
    return { data, error };
  },

  async signOutUser() {
    localStorage.removeItem("storyvault_current_user");
    if (!isSupabaseConfigValid) return { error: null };
    return await supabase.auth.signOut();
  }
};

export default authService;