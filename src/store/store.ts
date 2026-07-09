import { create } from 'zustand';

export type UserRole = 'commissioner' | 'emergency' | 'citizen' | null;

interface AppState {
  theme: 'light' | 'dark';
  role: UserRole;
  selectedCity: string;
  selectedWardId: string | null;
  mapOverlays: {
    heat: boolean;
    hospitals: boolean;
    water: boolean;
    cooling: boolean;
    trees: boolean;
  };
  filters: {
    risk: 'All' | 'Low' | 'Medium' | 'High' | 'Extreme';
    minTemp: number;
  };
  setTheme: (theme: 'light' | 'dark') => void;
  setRole: (role: UserRole) => void;
  setCity: (cityId: string) => void;
  setSelectedWardId: (id: string | null) => void;
  toggleOverlay: (overlay: 'heat' | 'hospitals' | 'water' | 'cooling' | 'trees') => void;
  resetOverlays: () => void;
  setRiskFilter: (risk: 'All' | 'Low' | 'Medium' | 'High' | 'Extreme') => void;
  setMinTempFilter: (temp: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  role: null,
  selectedCity: 'bengaluru',
  selectedWardId: null,
  mapOverlays: {
    heat: true,
    hospitals: false,
    water: false,
    cooling: false,
    trees: false,
  },
  filters: {
    risk: 'All',
    minTemp: 30,
  },
  setTheme: (theme) => set({ theme }),
  setRole: (role) => {
    // Automatically force dark mode if Emergency Operations is selected, else light
    const nextTheme = role === 'emergency' ? 'dark' : 'light';
    set({ role, theme: nextTheme });
    
    // Update HTML class for Tailwind dark selector
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  setCity: (cityId) => set({ selectedCity: cityId }),
  setSelectedWardId: (selectedWardId) => set({ selectedWardId }),
  toggleOverlay: (overlay) =>
    set((state) => ({
      mapOverlays: {
        ...state.mapOverlays,
        [overlay]: !state.mapOverlays[overlay],
      },
    })),
  resetOverlays: () =>
    set({
      mapOverlays: {
        heat: true,
        hospitals: false,
        water: false,
        cooling: false,
        trees: false,
      },
    }),
  setRiskFilter: (risk) =>
    set((state) => ({
      filters: {
        ...state.filters,
        risk,
      },
    })),
  setMinTempFilter: (minTemp) =>
    set((state) => ({
      filters: {
        ...state.filters,
        minTemp,
      },
    })),
}));
