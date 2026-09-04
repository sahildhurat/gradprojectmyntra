export interface ProgressState {
  checkedProducts: string[];
  resolvedProducts: string[];
  removedProducts: string[];
}

const STORAGE_KEY = 'match_check_progress';

export function getProgress(): ProgressState {
  if (typeof window === 'undefined') {
    return { checkedProducts: [], resolvedProducts: [], removedProducts: [] };
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to parse progress from localStorage", e);
  }
  return { checkedProducts: [], resolvedProducts: [], removedProducts: [] };
}

export function saveProgress(state: ProgressState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Dispatch a custom event so other components can reactively update
    window.dispatchEvent(new Event('progress_updated'));
  }
}

export function markProductChecked(productId: string) {
  const state = getProgress();
  if (!state.checkedProducts.includes(productId)) {
    state.checkedProducts.push(productId);
    saveProgress(state);
  }
}

export function markProductResolved(productId: string) {
  const state = getProgress();
  if (!state.resolvedProducts.includes(productId)) {
    state.resolvedProducts.push(productId);
    saveProgress(state);
  }
}

export function markProductRemoved(productId: string) {
  const state = getProgress();
  if (!state.removedProducts.includes(productId)) {
    state.removedProducts.push(productId);
    saveProgress(state);
  }
}
