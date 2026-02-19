const DEV_NAV_KEY = 'eleve-dev-navigation-enabled';
const DEV_ROLE_KEY = 'eleve-dev-navigation-role';

export type DevRole = 'student' | 'teacher' | 'guardian';

export const isDevNavigationEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DEV_NAV_KEY) === 'true';
};

export const setDevNavigationEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEV_NAV_KEY, enabled ? 'true' : 'false');
};

export const getDevNavigationRole = (): DevRole => {
  if (typeof window === 'undefined') return 'student';
  const stored = window.localStorage.getItem(DEV_ROLE_KEY);
  if (stored === 'teacher' || stored === 'guardian' || stored === 'student') return stored;
  return 'student';
};

export const setDevNavigationRole = (role: DevRole) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEV_ROLE_KEY, role);
};
