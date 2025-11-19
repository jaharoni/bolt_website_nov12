import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface SearchMapping {
  id: string;
  keyword: string;
  target_route: string;
}

interface StudioState {
  currentBg: string;
  nextBg: string;
  isTransitioning: boolean;
  agentMode: 'default' | 'search' | 'command';
  searchMappings: SearchMapping[];
  
  setAgentMode: (mode: 'default' | 'search' | 'command') => void;
  setBackground: (url: string) => void;
  transitionTo: (url: string) => void;
  completeTransition: () => void;
  fetchSearchMappings: () => Promise<void>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  currentBg: '',
  nextBg: '',
  isTransitioning: false,
  agentMode: 'default',
  searchMappings: [],

  setAgentMode: (mode) => set({ agentMode: mode }),

  setBackground: (url) => set({ currentBg: url, nextBg: '' }),

  transitionTo: (url) => {
    const { currentBg } = get();
    if (currentBg === url) return;
    
    set({ nextBg: url, isTransitioning: true });
  },

  completeTransition: () => {
    const { nextBg } = get();
    if (nextBg) {
      set({ currentBg: nextBg, nextBg: '', isTransitioning: false });
    } else {
      set({ isTransitioning: false });
    }
  },

  fetchSearchMappings: async () => {
    try {
      const { data, error } = await supabase
        .from('search_mappings')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        set({ searchMappings: data });
      }
    } catch (error) {
      console.error('Failed to fetch search mappings:', error);
    }
  }
}));
