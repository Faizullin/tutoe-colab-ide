import { User } from "@clerk/nextjs/server";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) =>
        set({
          user,
        }),
      logout: () => set({ user: null }), // ✅ Removed localStorage.removeItem()
    }),
    { name: "auth-storage" }
  )
);

export default useAuthStore;
