type Listener = () => void;

let title = "Settings";
let showBack = false;
let goBackFn: (() => void) | null = null;
let closeFn: (() => void) | null = null;
let isSearchMode = false;          // new
let onExitSearch: (() => void) | null = null; // new
const listeners = new Set<Listener>();

export const mobileSettingsStore = {
  getState() {
    return { title, showBack, isSearchMode };
  },
  setState(newTitle: string, newShowBack: boolean, newGoBack: () => void, newClose: () => void) {
    title = newTitle;
    showBack = newShowBack;
    goBackFn = newGoBack;
    closeFn = newClose;
    listeners.forEach(listener => listener());
  },
  // new: control search mode
  enterSearchMode(onExit: () => void) {
    isSearchMode = true;
    onExitSearch = onExit;
    listeners.forEach(listener => listener());
  },
  exitSearchMode() {
    isSearchMode = false;
    onExitSearch?.();
    onExitSearch = null;
    listeners.forEach(listener => listener());
  },
  goBack() {
    goBackFn?.();
  },
  close() {
    closeFn?.();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};