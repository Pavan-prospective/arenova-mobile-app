import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { queryClient } from '@/services/queryClient';

export type UserRole = 'coach' | 'parent' | 'individual' | null;

interface User {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  role: UserRole;
  isRegistered: boolean; // false if only OTP verified but profile not complete
  password?: string;
  sports?: string[];
  location?: string;
  achievements?: string;
  experience?: string;
  description?: string;
  certificates?: string[];
  status?: string;
  isEmailVerified?: boolean;
  skills?: string;
  idProof?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  selectedLocationId: string | null;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setSelectedLocationId: (id: string | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  logout: () => void;
  hydrateAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  selectedLocationId: null,
  soundEnabled: true,
  vibrationEnabled: true,

  setToken: (token) => {
    SecureStore.setItemAsync('auth_token', token).catch(console.error);
    set({ token });
  },

  setUser: (user) => {
    SecureStore.setItemAsync('auth_user', JSON.stringify(user)).catch(console.error);
    set({ user });
  },

  setSelectedLocationId: (id) => {
    if (id) {
      SecureStore.setItemAsync('selected_location_id', id).catch(console.error);
    } else {
      SecureStore.deleteItemAsync('selected_location_id').catch(console.error);
    }
    set({ selectedLocationId: id });
  },

  setSoundEnabled: (enabled) => {
    SecureStore.setItemAsync('pref_sound', enabled ? 'true' : 'false').catch(console.error);
    set({ soundEnabled: enabled });
  },

  setVibrationEnabled: (enabled) => {
    SecureStore.setItemAsync('pref_vibration', enabled ? 'true' : 'false').catch(console.error);
    set({ vibrationEnabled: enabled });
  },

  logout: () => {
    SecureStore.deleteItemAsync('auth_token').catch(console.error);
    SecureStore.deleteItemAsync('auth_user').catch(console.error);
    SecureStore.deleteItemAsync('selected_location_id').catch(console.error);
    SecureStore.deleteItemAsync('pref_sound').catch(console.error);
    SecureStore.deleteItemAsync('pref_vibration').catch(console.error);
    queryClient.clear();
    set({ token: null, user: null, selectedLocationId: null, soundEnabled: true, vibrationEnabled: true });
  },

  hydrateAuth: async () => {
    try {
      const [token, userStr, selectedLocationId, soundVal, vibrationVal] = await Promise.all([
        SecureStore.getItemAsync('auth_token'),
        SecureStore.getItemAsync('auth_user'),
        SecureStore.getItemAsync('selected_location_id'),
        SecureStore.getItemAsync('pref_sound'),
        SecureStore.getItemAsync('pref_vibration'),
      ]);

      set({
        token,
        user: userStr ? JSON.parse(userStr) : null,
        selectedLocationId,
        soundEnabled: soundVal !== 'false',
        vibrationEnabled: vibrationVal !== 'false',
        isLoading: false
      });
    } catch (e) {
      console.error('Failed to hydrate auth state:', e);
      set({ isLoading: false });
    }
  },
}));
