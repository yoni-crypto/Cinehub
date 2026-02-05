interface WatchProgress {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  poster: string;
  lastWatched: number;
  progress?: number; // 0-100 percentage
  season?: number;
  episode?: number;
  episodeName?: string;
}

const STORAGE_KEY = 'cinehub_continue_watching';
const MAX_ITEMS = 20;

export const continueWatching = {
  // Add item to continue watching
  add(item: Omit<WatchProgress, 'lastWatched'>) {
    const items = this.getAll();
    const existing = items.findIndex(i => i.id === item.id && i.type === item.type);
    
    const newItem: WatchProgress = {
      ...item,
      lastWatched: Date.now()
    };
    
    if (existing >= 0) {
      // Remove existing item and add to front
      items.splice(existing, 1);
    }
    
    // Always add to front (most recent first)
    items.unshift(newItem);
    
    // Keep only recent items
    const trimmed = items.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  },

  // Get all continue watching items
  getAll(): WatchProgress[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Get specific item
  get(id: string, type: 'movie' | 'tv'): WatchProgress | null {
    const items = this.getAll();
    return items.find(i => i.id === id && i.type === type) || null;
  },

  // Remove item
  remove(id: string, type: 'movie' | 'tv') {
    const items = this.getAll().filter(i => !(i.id === id && i.type === type));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  // Clear all
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};