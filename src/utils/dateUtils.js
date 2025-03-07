// Consistent timestamp for SSR and client hydration
export const INITIAL_TIMESTAMP = '2024-12-13T15:11:37+08:00';

export function getConsistentDate() {
  // During initial render, use the consistent timestamp
  if (typeof window === 'undefined') {
    return new Date(INITIAL_TIMESTAMP);
  }
  // After hydration, use the current time
  return new Date();
}

export function getConsistentNow() {
  return getConsistentDate().getTime();
}

export function getConsistentISOString() {
  return getConsistentDate().toISOString();
}

export function formatDate(date, options) {
  return new Date(date).toLocaleDateString('en-US', options);
}
