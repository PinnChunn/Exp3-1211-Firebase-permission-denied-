import { Event } from './types';
import { EVENTS_DATA } from '../constants';

const CACHE_KEY = 'exp3_events_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

interface CacheEntry {
  data: Event[];
  timestamp: number;
}

export const eventCache = {
  set: (events: Event[]) => {
    try {
      const entry: CacheEntry = {
        data: events,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch (error) {
      console.warn('Error caching events:', error);
    }
  },

  get: (): Event[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);
      const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
      
      return isExpired ? null : entry.data;
    } catch (error) {
      console.warn('Error reading cached events:', error);
      return null;
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing event cache:', error);
    }
  }
};