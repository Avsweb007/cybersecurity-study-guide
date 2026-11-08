import { ReferenceItem } from '../types/protocol';

const CUSTOM_ITEMS_KEY = 'netsec_custom_items_v1';
const BOOKMARKS_KEY = 'netsec_bookmarks_v1';
const STUDY_STATS_KEY = 'netsec_study_stats_v1';

export interface StudyStats {
  masteredIds: string[];
  reviewIds: string[];
  streak: number;
  totalAnswered: number;
}

export function loadCustomItems(): ReferenceItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ITEMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomItems(items: ReferenceItem[]): void {
  try {
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save custom items:', err);
  }
}

export function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return ['port-22', 'port-443', 'http-403'];
    return JSON.parse(raw);
  } catch {
    return ['port-22', 'port-443', 'http-403'];
  }
}

export function saveBookmarks(ids: string[]): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save bookmarks:', err);
  }
}

export function loadStudyStats(): StudyStats {
  try {
    const raw = localStorage.getItem(STUDY_STATS_KEY);
    if (!raw) {
      return { masteredIds: [], reviewIds: [], streak: 0, totalAnswered: 0 };
    }
    return JSON.parse(raw);
  } catch {
    return { masteredIds: [], reviewIds: [], streak: 0, totalAnswered: 0 };
  }
}

export function saveStudyStats(stats: StudyStats): void {
  try {
    localStorage.setItem(STUDY_STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save study stats:', err);
  }
}
