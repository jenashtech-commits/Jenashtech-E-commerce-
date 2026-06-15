/* Simple localStorage persistence. Works in any browser / on Vercel.
   For a real multi-user marketplace, replace these with API calls to a
   backend + database (see README). */

export const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode etc.) — app still works in-memory */
  }
};
